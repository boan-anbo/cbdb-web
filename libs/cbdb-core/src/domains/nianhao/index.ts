/**
 * NianHao Domain Exports
 */

// Models
export { NianHao } from './models/nianhao.model';

// Mapper
export { NianHaoMapper } from './nianhao.mapper';

// CQRS Messages
export {
  // Queries
  NianHaoGetQuery,
  NianHaoListQuery,
  NianHaoBatchGetQuery,
  // Results
  NianHaoGetResult,
  NianHaoListResult,
  NianHaoBatchGetResult,
} from './messages/nianhao.cqrs';

// DTOs
export {
  // Requests
  NianHaoBatchGetRequest,
  NianHaoListRequest,
  // Responses
  NianHaoGetResponse,
  NianHaoListResponse,
  NianHaoBatchGetResponse,
} from './messages/nianhao.dtos';