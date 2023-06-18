"use strict";

/**
 * event controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::event.event", ({ strapi }) => ({
  //@TODO this is to remove the need of populate but will require
  //additional work on the front end.
  // async find(ctx) {
  //   console.log("Find called...");

  //   console.log(ctx.query);

  //   ctx.query = {...ctx.query, populate:'*'};

  //   console.log(ctx.query);

  //   const { data, meta } = await super.find(ctx);

  //   return { data, meta };
  // },

  async me(ctx) {
    //get user information and if none is supplied it will
    //return unauthorized
    const user = ctx.state.user;
    if (!user) {
      return ctx.badRequest(null, [
        { messages: [{ id: "No authorization header was found" }] },
      ]);
    }

    ctx.query = {
      ...ctx.query,
      filters: { user: { id: user.id } },
      populate: "*",
    };

    //console.log(ctx.query);

    const { data, meta } = await super.find(ctx);

    return { data, meta };
  },

  ///overwrite create to link user to event
  async create(ctx) {
    const user = ctx.state.user;

    try {
      const evt = await super.create(ctx);
      //console.log(evt)
      const updated = await strapi.entityService.update(
        "api::event.event",
        evt.data.id,
        {
          data: {
            user: { id: user.id },
          },
        }
      );
      console.log(updated);
      return updated;
    } catch (e) {
      if (e.message.match("UNIQUE constraint failed") ) {
        return ctx.badRequest("An event already exist with that name");
      } else {
        console.log(`Error from strapi: ${e.message}`);
        return ctx.internalServerError("Internal Server Error");
      }
    }
  },
}));
