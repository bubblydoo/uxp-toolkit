import { convert } from "xmlbuilder2";
import { Document } from "photoshop/dom/Document";
import { batchPlayCommand, createCommand, executeAsModal } from "@bubblydoo/uxp-toolkit";
import { z } from "zod";

export const readDocumentMetadata = async (document: Document, { key, prefix }: { key: string, prefix: string }) => {
  const converted = await readAllDocumentMetadata(document);
  const property =
    converted["x:xmpmeta"]["rdf:RDF"]["rdf:Description"][`${prefix}:${key}`];

  return property;
};

export const readAllDocumentMetadata = async (document: Document) => {
  const metadata = await batchPlayCommand(
    createCommand({
      modifying: false,
      descriptor: {
        _obj: "get",
        _target: {
          _ref: [
            { _property: "XMPMetadataAsUTF8" },
            { _ref: "document", _id: document.id },
          ],
        },
      },
      schema: z.object({
        XMPMetadataAsUTF8: z.any(),
      })
    })
  );

  return convert(metadata.XMPMetadataAsUTF8, {
    format: "object",
  }) as any;
};

export const writeDocumentMetadata = async (document: Document, newProperty: { key: string, value: string, prefix: string, prefixNamespace: string }) => {
  const initialMetadata = await readAllDocumentMetadata(document);
  const obj = convert(initialMetadata, { format: "object" }) as any;
  obj["x:xmpmeta"]["rdf:RDF"]["rdf:Description"][
    `@xmlns:${newProperty.prefix}`
  ] = newProperty.prefixNamespace;
  obj["x:xmpmeta"]["rdf:RDF"]["rdf:Description"][
    `${newProperty.prefix}:${newProperty.key}`
  ] = newProperty.value;
  const newXmpString = convert(obj, { format: "xml" });
  await executeAsModal("Set Metadata", async (ctx) => {
    const command = createCommand({
      modifying: true,
      descriptor: {
        _obj: "set",
        _target: [
          { _ref: "property", _property: "XMPMetadataAsUTF8" },
          { _ref: "document", _id: document.id },
        ],
        to: {
          _obj: "document",
          XMPMetadataAsUTF8: newXmpString,
        },
      },
      schema: z.unknown(),
    });
    await ctx.batchPlayCommand(command, { synchronousExecution: true });
  });
};
