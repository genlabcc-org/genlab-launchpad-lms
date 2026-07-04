package cc.genlab.genlablaunchpadlmsapi.controller.admin;

import cc.genlab.genlablaunchpadlmsapi.annotation.RequiresRole;
import cc.genlab.genlablaunchpadlmsapi.model.dto.BatchDto;
import cc.genlab.genlablaunchpadlmsapi.service.BatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/batches")
@RequiresRole("admin")
@RequiredArgsConstructor
public class AdminBatchController {

    private final BatchService batchService;

    @GetMapping
    public List<BatchDto> getAllBatches() {
        return batchService.getAllBatches();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BatchDto createBatch(@RequestBody BatchDto dto) {
        return batchService.createBatch(dto);
    }

    @PutMapping("/{id}")
    public BatchDto updateBatch(@PathVariable String id, @RequestBody BatchDto dto) {
        return batchService.updateBatch(id, dto);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBatch(@PathVariable String id) {
        batchService.deleteBatch(id);
    }
}
