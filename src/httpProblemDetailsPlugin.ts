import { ErrorStatusCodes, StatusCodeErrorMapper } from 'http-problem-details-mapper'

const EVENT_ON_PRE_RESPONSE = 'onPreResponse'
const MIME_TYPE = 'application/problem+json'

const HttpProblemDetailsPlugin = {
  name: 'hapi-http-problem-details',
  version: '0.1.0',
  register: (server, options): void => {
    const strategy = options.strategy
    server.ext(EVENT_ON_PRE_RESPONSE, async (req, h): Promise<any> => {
      const isError = req.response instanceof Error

      if (isError) {
        const problem = strategy.map(req.response)

        return h.response(problem)
          .type(MIME_TYPE)
          .code(problem.status)
      }

      if (!isError && ErrorStatusCodes.includes(req.response.statusCode)) {
        const problemDocument = StatusCodeErrorMapper.mapStatusCode(req.response.statusCode)

        return h.response(problemDocument)
          .type(MIME_TYPE)
          .code(problemDocument.status)
      }

      return req.response
    })
  }
}

export { HttpProblemDetailsPlugin }
