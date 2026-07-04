package cc.genlab.genlablaunchpadlmsapi.service;

import cc.genlab.genlablaunchpadlmsapi.model.dto.BatchDto;
import cc.genlab.genlablaunchpadlmsapi.model.entity.Batch;
import cc.genlab.genlablaunchpadlmsapi.repository.BatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BatchService {

    private final BatchRepository batchRepository;

    @Transactional(readOnly = true)
    public List<BatchDto> getAllBatches() {
        return batchRepository.findAll().stream()
                .map(BatchDto::fromEntity)
                .toList();
    }

    @Transactional
    public BatchDto createBatch(BatchDto dto) {
        if (dto.id() == null || dto.id().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch ID is required");
        }
        if (batchRepository.existsById(dto.id())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Batch with ID " + dto.id() + " already exists");
        }

        Batch batch = Batch.builder()
                .id(dto.id())
                .name(dto.name())
                .startDate(dto.startDate())
                .cutoffDate(dto.cutoffDate())
                .build();

        return BatchDto.fromEntity(batchRepository.save(batch));
    }

    @Transactional
    public BatchDto updateBatch(String id, BatchDto dto) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

        batch.setName(dto.name());
        batch.setStartDate(dto.startDate());
        batch.setCutoffDate(dto.cutoffDate());

        return BatchDto.fromEntity(batchRepository.save(batch));
    }

    @Transactional
    public void deleteBatch(String id) {
        if (!batchRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found");
        }
        batchRepository.deleteById(id);
    }
}
