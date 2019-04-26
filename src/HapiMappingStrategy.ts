import { IMappingStrategy, MapperRegistry } from 'http-problem-details-mapper'
import { ProblemDocument } from 'http-problem-details'

export class HapiMappingStrategy implements IMappingStrategy {
  public registry: MapperRegistry

  public constructor (registry: MapperRegistry) {
    this.registry = registry
  }

  public map (error): ProblemDocument {
    return this.registry.getMapper(error).mapError(error)
  }
}
