import 'should'
import { HapiMappingStrategy } from '../src'
import { MapperRegistry } from 'http-problem-details-mapper'

describe('HapiMappingStrategy', (): void => {
  describe('When mapping', (): void => {
    it('should return status code 500 problem', function (done): void {
      const strategy = new HapiMappingStrategy(new MapperRegistry())
      const problem = strategy.map(new Error())
      problem.type.should.equal('about:blank')
      problem.status.should.equal(500)
      return done()
    })
  })
})
