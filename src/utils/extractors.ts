/**
 * Backend Response Adapter Layer
 * Handles various response shapes from the API to ensure consistent data extraction
 * Prevents crashes from unexpected response structures
 */

export interface ExtractorOptions {
  debug?: boolean;
}

/**
 * Extract array from various response shapes
 * Handles: response.data, response.items, response.users, etc.
 */
export function extractArray<T = any>(
  response: any,
  options?: ExtractorOptions
): T[] {
  if (!response) {
    if (options?.debug) console.warn("[Extractor] No response provided");
    return [];
  }

  // If response is already an array
  if (Array.isArray(response)) {
    return response;
  }

  // Check common patterns
  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  // Check for singular keys (users, students, events, etc.)
  for (const key of Object.keys(response)) {
    if (Array.isArray(response[key])) {
      return response[key];
    }
  }

  if (options?.debug) {
    console.warn("[Extractor] Could not extract array from response:", response);
  }

  return [];
}

/**
 * Extract pagination metadata
 * Handles: pagination object, page/limit, meta object
 */
export interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export function extractPagination(
  response: any,
  options?: ExtractorOptions
): PaginationData {
  const defaultPagination: PaginationData = {
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  };

  if (!response) return defaultPagination;

  // Check for pagination object
  if (response.pagination) {
    return {
      page: response.pagination.page || 1,
      limit: response.pagination.limit || response.pagination.pageSize || 20,
      total: response.pagination.total || 0,
      pages: response.pagination.pages || 0,
    };
  }

  // Check for meta object
  if (response.meta) {
    return {
      page: response.meta.page || response.meta.currentPage || 1,
      limit: response.meta.limit || response.meta.pageSize || 20,
      total: response.meta.total || response.meta.totalCount || 0,
      pages: response.meta.pages || response.meta.totalPages || 0,
    };
  }

  // Check for top-level pagination fields
  if (response.page !== undefined || response.limit !== undefined) {
    return {
      page: response.page || 1,
      limit: response.limit || response.pageSize || 20,
      total: response.total || response.totalCount || 0,
      pages: response.pages || response.totalPages || 0,
    };
  }

  if (options?.debug) {
    console.warn("[Extractor] Could not extract pagination from response:", response);
  }

  return defaultPagination;
}

/**
 * Extract metadata/info object
 * Handles: response.meta, response.metadata, response.info
 */
export function extractMeta(response: any, options?: ExtractorOptions): Record<string, any> {
  if (!response) return {};

  // Check common meta patterns
  if (response.meta && typeof response.meta === "object") {
    return response.meta;
  }

  if (response.metadata && typeof response.metadata === "object") {
    return response.metadata;
  }

  if (response.info && typeof response.info === "object") {
    return response.info;
  }

  if (options?.debug) {
    console.warn("[Extractor] Could not extract meta from response:", response);
  }

  return {};
}

/**
 * Extract error message from response
 * Handles various error response shapes
 */
export function extractError(response: any, defaultMessage: string = "An error occurred"): string {
  if (!response) return defaultMessage;

  // Direct message
  if (typeof response.message === "string") {
    return response.message;
  }

  // Error object with message
  if (response.error && typeof response.error === "object") {
    if (typeof response.error.message === "string") {
      return response.error.message;
    }
    if (typeof response.error === "string") {
      return response.error;
    }
  }

  // Errors array (common in form validation)
  if (Array.isArray(response.errors) && response.errors.length > 0) {
    const firstError = response.errors[0];
    if (typeof firstError === "string") {
      return firstError;
    }
    if (typeof firstError.message === "string") {
      return firstError.message;
    }
  }

  // Detail field
  if (typeof response.detail === "string") {
    return response.detail;
  }

  return defaultMessage;
}

/**
 * Extract single item from response
 * Useful for create/update operations
 */
export function extractItem<T = any>(response: any, options?: ExtractorOptions): T | null {
  if (!response) return null;

  // If response itself is the item
  if (!Array.isArray(response) && typeof response === "object" && response.id) {
    return response as T;
  }

  // Check data field
  if (response.data && !Array.isArray(response.data) && typeof response.data === "object") {
    return response.data as T;
  }

  // Check item field
  if (response.item && typeof response.item === "object") {
    return response.item as T;
  }

  if (options?.debug) {
    console.warn("[Extractor] Could not extract item from response:", response);
  }

  return null;
}

/**
 * Safely extract value at any path from response
 * Useful for getting nested values
 */
export function extractValue(
  response: any,
  path: string,
  defaultValue: any = undefined
): any {
  if (!response) return defaultValue;

  const parts = path.split(".");
  let current = response;

  for (const part of parts) {
    if (current && typeof current === "object" && part in current) {
      current = current[part];
    } else {
      return defaultValue;
    }
  }

  return current;
}
