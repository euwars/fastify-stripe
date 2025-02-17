"use strict";

const fp = require("fastify-plugin");
const fs = require("fs");
const path = require("path");

function fastifyStripe(fastify, options, next) {
  const { apiKey, name, ...stripeOptions } = options;

  if (!apiKey) {
    return next(new Error("You must provide a Stripe API key"));
  }

  const config = Object.assign(
    {
      appInfo: {
        name: "fastify-stripe",
        url: "https://github.com/coopflow/fastify-stripe",
        version: JSON.parse(
          fs.readFileSync(path.join(__dirname, "package.json")),
        ).version,
      },
    },
    stripeOptions,
  );

  const stripe = require("stripe")(apiKey, config);

  if (name) {
    if (stripe[name]) {
      return next(new Error(`fastify-stripe '${name}' is a reserved keyword`));
    } else if (!fastify.stripe) {
      fastify.decorate("stripe", Object.create(null));
    } else if (Object.prototype.hasOwnProperty.call(fastify.stripe, name)) {
      return next(
        new Error(`Stripe '${name}' instance name has already been registered`),
      );
    }

    fastify.stripe[name] = stripe;
  } else {
    if (fastify.stripe) {
      return next(new Error("fastify-stripe has already been registered"));
    } else {
      fastify.decorate("stripe", stripe);
    }
  }

  next();
}

export default fp(fastifyStripe, {
  fastify: ">=2.11.0",
  name: "fastify-stripe",
});
