import type { UxpConnection } from '@bubblydoo/uxp-devtools-common';
import { evaluateInUxp } from '@bubblydoo/uxp-devtools-common';
import { z } from 'zod';
import { wrapCodeWithRuntime } from './runtime-wrapper';

/**
 * Schema for the execute tool input
 */
export const executeToolSchema = {
  name: z.string(),
  code: z.string(),
};

export type ExecuteToolInput = z.infer<z.ZodObject<typeof executeToolSchema>>;

/**
 * Execute JavaScript code in Photoshop and return the result.
 */
export async function executeInPhotoshop(connection: UxpConnection, input: ExecuteToolInput): Promise<{
  success: true;
  result: {
    objectId: string;
    value: unknown;
  };
} | {
  success: false;
  error: string;
  errorStep: string;
}> {
  try {
    console.log('wrapping code...');

    const wrappedCodeResult = await wrapCodeWithRuntime(input.code);

    if (!wrappedCodeResult.success) {
      return {
        success: false,
        error: wrappedCodeResult.error,
        errorStep: 'wrapCodeWithRuntime',
      };
    }

    const wrappedCode = wrappedCodeResult.result;

    // const wrappedCodePath = path.join(__dirname, 'wrapped-code.js');
    // await fs.writeFile(wrappedCodePath, wrappedCode);

    // Evaluate the code
    const result = await evaluateInUxp(
      connection,
      wrappedCode,
      true,
    );

    if (!result.success) {
      return {
        success: false,
        error: result.error,
        errorStep: `evaluateInPhotoshop: ${result.errorStep}`,
      };
    }

    console.log('result', result.result);

    return {
      success: true,
      result: {
        objectId: result.result.objectId!,
        value: result.result.value!,
      },
    };
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
      errorStep: 'general',
    };
  }
}
