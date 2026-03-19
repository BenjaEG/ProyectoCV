package ar.com.inaudi.CentroVecinal.service;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.Locale;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import ar.com.inaudi.CentroVecinal.dto.attachment.AttachmentResponse;
import ar.com.inaudi.CentroVecinal.exception.BadRequestException;
import ar.com.inaudi.CentroVecinal.exception.ForbiddenException;
import ar.com.inaudi.CentroVecinal.exception.ResourceNotFoundException;
import ar.com.inaudi.CentroVecinal.mapper.TicketMapper;
import ar.com.inaudi.CentroVecinal.model.Attachment;
import ar.com.inaudi.CentroVecinal.model.Ticket;
import ar.com.inaudi.CentroVecinal.repository.AttachmentRepository;
import ar.com.inaudi.CentroVecinal.repository.TicketRepository;
import ar.com.inaudi.CentroVecinal.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AttachmentService {

    private static final long MAX_FILE_SIZE_BYTES = 10L * 1024L * 1024L;
    private static final int MAX_ATTACHMENTS_PER_TICKET = 5;
    private static final Set<String> ALLOWED_CONTENT_TYPES = Set.of("image/jpeg", "image/png", "image/webp");
    private static final Map<String, Set<String>> ALLOWED_EXTENSIONS_BY_CONTENT_TYPE = Map.of(
            "image/jpeg", Set.of(".jpg", ".jpeg"),
            "image/png", Set.of(".png"),
            "image/webp", Set.of(".webp")
    );

    private final AttachmentRepository attachmentRepository;
    private final TicketRepository ticketRepository;
    private final Path storageRoot;

    public AttachmentService(AttachmentRepository attachmentRepository,
                             TicketRepository ticketRepository,
                             @Value("${app.attachments.storage-path:uploads}") String storagePath) {

        this.attachmentRepository = attachmentRepository;
        this.ticketRepository = ticketRepository;
        this.storageRoot = Paths.get(storagePath).toAbsolutePath().normalize();
    }

    @Transactional
    public AttachmentResponse addAttachment(Long ticketId, MultipartFile file, CurrentUser currentUser) {
        Ticket ticket = getAccessibleTicket(ticketId, currentUser);
        ValidatedAttachment validatedAttachment = validateFile(ticketId, file);

        String originalFileName = validatedAttachment.originalFileName();
        String extension = validatedAttachment.extension();
        String storedFileName = UUID.randomUUID() + extension;
        Path ticketDirectory = storageRoot.resolve("tickets").resolve(String.valueOf(ticketId));
        Path targetFile = ticketDirectory.resolve(storedFileName).normalize();

        try {
            Files.createDirectories(ticketDirectory);
            Files.write(targetFile, validatedAttachment.bytes());
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo guardar el archivo adjunto");
        }

        Attachment attachment = new Attachment();
        attachment.setTicket(ticket);
        attachment.setFileName(originalFileName);
        attachment.setFilePath(storageRoot.relativize(targetFile).toString().replace('\\', '/'));
        attachment.setContentType(validatedAttachment.contentType());
        attachment.setSizeBytes((long) validatedAttachment.bytes().length);
        attachment.setUploadedAt(LocalDateTime.now());

        return TicketMapper.toAttachmentResponse(attachmentRepository.save(attachment));
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, CurrentUser currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado"));

        getAccessibleTicket(attachment.getTicket().getId(), currentUser);

        Path filePath = storageRoot.resolve(attachment.getFilePath()).normalize();
        if (filePath.startsWith(storageRoot)) {
            try {
                Files.deleteIfExists(filePath);
                deleteEmptyParentDirectories(filePath.getParent());
            } catch (IOException ex) {
                throw new BadRequestException("No se pudo eliminar el archivo adjunto");
            }
        }

        attachmentRepository.delete(attachment);
    }

    @Transactional(readOnly = true)
    public List<AttachmentResponse> getAttachmentsByTicket(Long ticketId, CurrentUser currentUser) {
        getAccessibleTicket(ticketId, currentUser);

        return attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticketId)
                .stream()
                .map(TicketMapper::toAttachmentResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Attachment> getAttachmentEntitiesByTicket(Long ticketId) {
        return attachmentRepository.findByTicketIdOrderByUploadedAtAsc(ticketId);
    }

    @Transactional(readOnly = true)
    public AttachmentFileResult getAttachmentFile(Long attachmentId, CurrentUser currentUser) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Adjunto no encontrado"));

        getAccessibleTicket(attachment.getTicket().getId(), currentUser);

        Path filePath = storageRoot.resolve(attachment.getFilePath()).normalize();
        if (!filePath.startsWith(storageRoot) || !Files.exists(filePath)) {
            throw new ResourceNotFoundException("Archivo adjunto no encontrado");
        }

        try {
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Archivo adjunto no encontrado");
            }
            return new AttachmentFileResult(resource, attachment.getFileName(), attachment.getContentType());
        } catch (MalformedURLException ex) {
            throw new ResourceNotFoundException("Archivo adjunto no encontrado");
        }
    }

    private Ticket getAccessibleTicket(Long ticketId, CurrentUser currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket no encontrado"));

        if (currentUser.isNeighbor() && !ticket.getCreatedByUserId().equals(currentUser.userId())) {
            throw new ForbiddenException("No tienes permisos para acceder a este ticket");
        }

        return ticket;
    }

    private ValidatedAttachment validateFile(Long ticketId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Debes adjuntar una imagen");
        }

        if (attachmentRepository.countByTicketId(ticketId) >= MAX_ATTACHMENTS_PER_TICKET) {
            throw new BadRequestException("Cada ticket puede tener hasta 5 imagenes");
        }

        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new BadRequestException("La imagen no puede superar los 10 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType)) {
            throw new BadRequestException("Solo se permiten imagenes JPG, PNG o WEBP");
        }

        String originalFileName = normalizeFileName(file.getOriginalFilename());
        String extension = getExtension(originalFileName);
        validateExtension(contentType, extension);

        byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException ex) {
            throw new BadRequestException("No se pudo leer la imagen adjunta");
        }

        if (!matchesFileSignature(contentType, bytes)) {
            throw new BadRequestException("El archivo adjunto no es una imagen valida");
        }

        return new ValidatedAttachment(originalFileName, extension, contentType, bytes);
    }

    private String normalizeFileName(String originalFilename) {
        String fileName = originalFilename == null ? "imagen" : Paths.get(originalFilename).getFileName().toString().trim();
        if (fileName.isBlank()) {
            return "imagen";
        }
        String sanitized = fileName
                .replaceAll("[\\p{Cntrl}]+", "")
                .replaceAll("[^A-Za-z0-9._-]", "_");

        if (sanitized.isBlank()) {
            return "imagen";
        }

        return sanitized.length() > 150 ? sanitized.substring(sanitized.length() - 150) : sanitized;
    }

    private String getExtension(String fileName) {
        int dotIndex = fileName.lastIndexOf('.');
        if (dotIndex < 0 || dotIndex == fileName.length() - 1) {
            return "";
        }

        return fileName.substring(dotIndex).toLowerCase(Locale.ROOT);
    }

    private void validateExtension(String contentType, String extension) {
        Set<String> allowedExtensions = ALLOWED_EXTENSIONS_BY_CONTENT_TYPE.get(contentType);
        if (allowedExtensions == null || extension.isBlank() || !allowedExtensions.contains(extension)) {
            throw new BadRequestException("La extension del archivo no coincide con el tipo de imagen permitido");
        }
    }

    private boolean matchesFileSignature(String contentType, byte[] bytes) {
        return switch (contentType) {
            case "image/jpeg" -> isJpeg(bytes);
            case "image/png" -> isPng(bytes);
            case "image/webp" -> isWebp(bytes);
            default -> false;
        };
    }

    private boolean isJpeg(byte[] bytes) {
        return bytes.length >= 3
                && (bytes[0] & 0xFF) == 0xFF
                && (bytes[1] & 0xFF) == 0xD8
                && (bytes[2] & 0xFF) == 0xFF;
    }

    private boolean isPng(byte[] bytes) {
        return bytes.length >= 8
                && (bytes[0] & 0xFF) == 0x89
                && bytes[1] == 0x50
                && bytes[2] == 0x4E
                && bytes[3] == 0x47
                && bytes[4] == 0x0D
                && bytes[5] == 0x0A
                && bytes[6] == 0x1A
                && bytes[7] == 0x0A;
    }

    private boolean isWebp(byte[] bytes) {
        return bytes.length >= 12
                && bytes[0] == 'R'
                && bytes[1] == 'I'
                && bytes[2] == 'F'
                && bytes[3] == 'F'
                && bytes[8] == 'W'
                && bytes[9] == 'E'
                && bytes[10] == 'B'
                && bytes[11] == 'P';
    }

    private void deleteEmptyParentDirectories(Path directory) throws IOException {
        Path current = directory;
        Path ticketsRoot = storageRoot.resolve("tickets").normalize();

        while (current != null && current.startsWith(ticketsRoot) && !current.equals(ticketsRoot)) {
            try (var stream = Files.list(current)) {
                if (stream.findAny().isPresent()) {
                    return;
                }
            }
            Files.deleteIfExists(current);
            current = current.getParent();
        }
    }

    public record AttachmentFileResult(Resource resource, String fileName, String contentType) {
    }

    private record ValidatedAttachment(String originalFileName, String extension, String contentType, byte[] bytes) {
    }
}
