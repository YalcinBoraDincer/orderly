package com.bora.orderly.service;

import com.bora.orderly.dto.request.TableRequest;
import com.bora.orderly.dto.response.TableResponse;
import com.bora.orderly.enums.TableStatus;
import java.util.List;

public interface ITableService {
    List<TableResponse> getAllTables();
    TableResponse getTableById(Long id);
    TableResponse createTable(TableRequest request);
    TableResponse updateTableStatus(Long id, TableStatus status);
    byte[] generateQrCode(Long id) throws Exception;
    void deleteTable(Long id);

}
