# HTTP Problem Details for hapi

Based on `http-problem-details` ([repository](https://github.com/PDMLab/http-problem-details) | [npm](https://www.npmjs.com/package/http-problem-details)) and `http-problem-details-mapper` ([repository](https://github.com/PDMLab/http-problem-details-mapper) | [npm](https://www.npmjs.com/package/http-problem-details-mapper)), this library allows you to map your Node.js errors to HTTP Problem details according to [RFC7807](https://tools.ietf.org/html/rfc7807) by convention for your hapi application.

## Installation

```
npm install http-problem-details http-problem-details-mapper hapi-http-problem-details
```

or

```
yarn add http-problem-details http-problem-details-mapper hapi-http-problem-details
```

## Usage

`hapi-http-problem-details` provides a plugin which allows you to map custom `Error` instances to HTTP Problem Details documents according to RFC7807.

The details of the mapping itself are described in `http-problem-details-mapper` ([repository](https://github.com/PDMLab/http-problem-details-mapper) | [npm](https://www.npmjs.com/package/http-problem-details-mapper))

### TypeScript

The typical workflow in TypeScript with `hapi-http-problem-details` is this:

First, you implement an Error

```typescript
class NotFoundError extends Error {
  public constructor (options: { type: string, id: string }) {
    const { type, id } = options
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = 'NotFoundError'
    this.message = `${type} with id ${id} could not be found.`
  }
}
```

Next, you implement an `IErrorMapper` (noticed we cheated? Instead of the `ErrorMapper` class, in TypeScript you can use an `interface`):

```typescript
class NotFoundErrorMapper implements IErrorMapper {
  public error: string = NotFoundError.name;

  public mapError (error: Error): ProblemDocument {
    return new ProblemDocument({
      status: 404,
      title: error.message,
      type: 'http://tempuri.org/NotFoundError'
    })
  }
}
```

Finally, create an instance of `DefaultMappingStrategy` and register everything in your `app`.

```typescript
import * as Hapi from "@hapi/hapi";
import { DefaultMappingStrategy } from 'hapi-http-problem-details-mapper'
import { HttpProblemDetailsPlugin } from 'hapi-http-problem-details'

const strategy = new DefaultMappingStrategy(
    new MapperRegistry()
        .registerMapper(new NotFoundErrorMapper()));

const init = async () => {

  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  await server.register([{
    plugin: HttpProblemDetailsPlugin,
    options: { strategy }
  }]);

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      throw new NotFoundError({type: 'customer', id: '123'})
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
```

When GETting localhost:3000, the result will be like this:

```bash
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 107
Content-Type: application/problem+json; charset=utf-8
Date: Wed, 24 Apr 2019 23:48:27 GMT

{
    "status": 404,
    "title": "customer with id 123 could not be found.",
    "type": "http://tempuri.org/NotFoundError"
}

```

When just returning a `return h.response().code(500)`, you'll get a response like this:

```bash
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 67
Content-Type: application/problem+json; charset=utf-8
Date: Thu, 25 Apr 2019 00:01:48 GMT

{
    "status": 500,
    "title": "Internal Server Error",
    "type": "about:blank"
}

```

### JavaScript / ES2015

The typical workflow in JavaScript/ES2015 with `hapi-http-problem-details` is this:

First, you implement an Error

```js
class NotFoundError extends Error {
  constructor (options) {
    const { type, id } = options
    super()
    Error.captureStackTrace(this, this.constructor)
    this.name = 'NotFoundError'
    this.message = `${type} with id ${id} could not be found.`
  }
}
```

Next, you extend the  `ErrorMapper` class:

```js
class NotFoundErrorMapper extends ErrorMapper {
  constructor() {
    this.error = NotFoundError.name;
  }

  mapError (error) {
    return new ProblemDocument({
      status: 404,
      title: error.message,
      type: 'http://tempuri.org/NotFoundError'
    })
  }
}
```

Finally, create an instance of `DefaultMappingStrategy` and register everything in your `app`.

```js
const Hapi = require('@hapi/hapi');
const MapperRegistry = require('http-problem-details-mapper').MapperRegistry;
const DefaultMappingStrategy = require('http-problem-details-mapper').DefaultMappingStrategy;
const plugin = require('hapi-http-problem-details').HttpProblemDetailsPlugin;
const strategy = new DefaultMappingStrategy(new MapperRegistry());

const init = async () => {

  const server = Hapi.server({
    port: 3000,
    host: 'localhost'
  });

  await server.register([{
    plugin: plugin,
    options: { strategy }
  }]);

  server.route({
    method: 'GET',
    path: '/',
    handler: (request, h) => {
      throw new NotFoundError({type: 'customer', id: '123'})
    }
  });

  await server.start();
  console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
```

When GETting localhost:3000, the result will be like this:

```bash
HTTP/1.1 404 Not Found
Connection: keep-alive
Content-Length: 107
Content-Type: application/problem+json; charset=utf-8
Date: Wed, 24 Apr 2019 23:48:27 GMT

{
    "status": 404,
    "title": "customer with id 123 could not be found.",
    "type": "http://tempuri.org/NotFoundError"
}

```

When just returning a `return h.response().code(500)`, you'll get a response like this:

```bash
HTTP/1.1 500 Internal Server Error
Connection: keep-alive
Content-Length: 67
Content-Type: application/problem+json; charset=utf-8
Date: Thu, 25 Apr 2019 00:01:48 GMT

{
    "status": 500,
    "title": "Internal Server Error",
    "type": "about:blank"
}

```

## Running the tests

```
npm test
```

or

```
yarn test
```

## Want to help?

This project is just getting off the ground and could use some help with cleaning things up and refactoring.

If you want to contribute - we'd love it! Just open an issue to work against so you get full credit for your fork. You can open the issue first so we can discuss and you can work your fork as we go along.

If you see a bug, please be so kind as to show how it's failing, and we'll do our best to get it fixed quickly.

Before sending a PR, please [create an issue](https://github.com/PDMLab/http-problem-details/issues/new) to introduce your idea and have a reference for your PR.

Also please add tests and make sure to run `npm run lint-ts` or `yarn lint-ts`.

## License

MIT License

Copyright (c) 2019 PDMLab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.


