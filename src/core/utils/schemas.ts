import { FastifySchema } from "fastify";
import { CheckFrequency } from "../../feature/alert/model/enum/checkFrequency.enum";

const OBJECT_TYPE = "object";
const NUMBER_TYPE = "number";
const STRING_TYPE = "string";
const BOOLEAN_TYPE = "boolean";
const DATE_TIME_FORMAT = "date-time";
const URI_FORMAT = "uri";

/**
 * Schema for request parameters with ID.
 */
export const alertParamsSchema = {
  type: OBJECT_TYPE,
  required: ["id"],
  properties: {
    id: { type: STRING_TYPE, format: "uuid" },
  },
};

/**
 * Schema for creating an alert.
 * Validates the request body to ensure it contains the required fields: "productUrl", "desiredPrice".
 */
export const createAlertSchema: FastifySchema = {
  body: {
    type: OBJECT_TYPE,
    required: ["productUrl", "desiredPrice"],
    properties: {
      productUrl: { type: STRING_TYPE, format: URI_FORMAT },
      desiredPrice: { type: NUMBER_TYPE, minimum: 0 },
      checkFrequency: {
        type: STRING_TYPE,
        enum: Object.values(CheckFrequency),
        default: CheckFrequency.DAILY,
      },
    },
  },
  response: {
    201: {
      type: OBJECT_TYPE,
      properties: {
        success: { type: BOOLEAN_TYPE },
        message: { type: STRING_TYPE },
        data: {
          type: OBJECT_TYPE,
          properties: {
            id: { type: STRING_TYPE },
            productUrl: { type: STRING_TYPE },
            desiredPrice: { type: NUMBER_TYPE },
            checkFrequency: { type: STRING_TYPE },
            isActive: { type: BOOLEAN_TYPE },
            createdAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
            updatedAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
          },
        },
      },
    },
  },
};

/*
 * Schema for updating an alert.
 */
export const updateAlertSchema: FastifySchema = {
  body: {
    type: OBJECT_TYPE,
    properties: {
      productUrl: { type: STRING_TYPE, format: URI_FORMAT },
      desiredPrice: { type: NUMBER_TYPE, minimum: 0 },
      checkFrequency: {
        type: STRING_TYPE,
        enum: Object.values(CheckFrequency),
      },
    },
    minProperties: 1, // At least one property must be provided
  },
  response: {
    200: {
      type: OBJECT_TYPE,
      properties: {
        success: { type: BOOLEAN_TYPE },
        message: { type: STRING_TYPE },
        data: {
          type: OBJECT_TYPE,
          properties: {
            id: { type: STRING_TYPE },
            productUrl: { type: STRING_TYPE },
            desiredPrice: { type: NUMBER_TYPE },
            checkFrequency: { type: STRING_TYPE },
            isActive: { type: BOOLEAN_TYPE },
            createdAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
            updatedAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
          },
        },
      },
    },
  },
};

/*
 * Schema for alert responses
 */
export const alertResponseSchema = {
  type: OBJECT_TYPE,
  properties: {
    success: { type: BOOLEAN_TYPE },
    message: { type: STRING_TYPE },
    data: {
      type: OBJECT_TYPE,
      properties: {
        id: { type: STRING_TYPE },
        productUrl: { type: STRING_TYPE },
        desiredPrice: { type: NUMBER_TYPE },
        checkFrequency: { type: STRING_TYPE },
        isActive: { type: BOOLEAN_TYPE },
        createdAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
        updatedAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
      },
    },
  },
};

/*
 * Schema for getting all alerts.
 */
export const getAllAlertsSchema: FastifySchema = {
  response: {
    200: {
      type: OBJECT_TYPE,
      properties: {
        success: { type: BOOLEAN_TYPE },
        count: { type: NUMBER_TYPE },
        data: {
          type: "array",
          items: {
            type: OBJECT_TYPE,
            properties: {
              id: { type: STRING_TYPE },
              productUrl: { type: STRING_TYPE },
              desiredPrice: { type: NUMBER_TYPE },
              checkFrequency: { type: STRING_TYPE },
              isActive: { type: BOOLEAN_TYPE },
              createdAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
              updatedAt: { type: STRING_TYPE, format: DATE_TIME_FORMAT },
            },
          },
        },
      },
    },
  },
};
