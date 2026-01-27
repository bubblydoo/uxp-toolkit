// Taken from: https://github.com/maheshsundaram/performance-measure-polyfill/blob/master/measure.ts

// References:
// https://w3c.github.io/user-timing/#dom-performance-measure
// https://deno.land/x/deno@v1.38.0/ext/web/15_performance.js

// 4.1. Convert a mark to a timestamp
function convertMarkToTimestamp(mark) {
  if (typeof mark === "string") {
    const entries = performance
      .getEntriesByType("mark")
      .filter((m) => m.name === mark);
    const entry = entries[entries.length - 1];
    if (!entry) {
      throw new DOMException(`Cannot find mark: "${mark}".`, "SyntaxError");
    }
    return entry.startTime;
  }
  if (mark < 0) {
    throw new TypeError("Mark cannot be negative.");
  }
  return mark;
}

// 3.1.3 measure() method
export function performanceMeasurePolyfill(
  measureName,
  startOrMeasureOptions,
  endMark,
) {
  let startTime = undefined;
  let endTime = undefined;

  const isOptions = (v) =>
    typeof v === "object" && v !== null && !Array.isArray(v);

  // 1. If startOrMeasureOptions is a PerformanceMeasureOptions object and at least one of start, end, duration, and detail exist, run the following checks:
  if (isOptions(startOrMeasureOptions)) {
    // 1.1. If endMark is given, throw a TypeError.
    if (endMark) {
      throw new TypeError(
        "If startOrMeasureOptions is an object, endMark cannot be provided.",
      );
    }

    if (
      // 1.2. If startOrMeasureOptions's start and end members are both omitted, throw a TypeError.
      (startOrMeasureOptions.start === undefined &&
        startOrMeasureOptions.end === undefined) ||
      // 1.3. If startOrMeasureOptions's start, duration, and end members all exist, throw a TypeError.
      (startOrMeasureOptions.start !== undefined &&
        startOrMeasureOptions.end !== undefined &&
        startOrMeasureOptions.duration !== undefined)
    ) {
      throw new TypeError("Invalid startOrMeasureOptions.");
    }
  }

  // 2. Compute end time as follows:
  // 2.1. If endMark is given, let end time be the value returned by running the convert a mark to a timestamp algorithm passing in endMark.
  if (endMark !== undefined && typeof startOrMeasureOptions === "string") {
    endTime = convertMarkToTimestamp(endMark);
  }
  // 2.2. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its end member exists, let end time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions's end.
  if (isOptions(startOrMeasureOptions)) {
    if (startOrMeasureOptions.end !== undefined) {
      endTime = convertMarkToTimestamp(startOrMeasureOptions.end);
    } // 2.3. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its start and duration members both exist:
    else if (
      startOrMeasureOptions.start !== undefined &&
      startOrMeasureOptions.duration !== undefined
    ) {
      // 2.3.1. Let start be the value returned by running the convert a mark to a timestamp algorithm passing in start.
      const start = convertMarkToTimestamp(startOrMeasureOptions.start);
      // 2.3.2. Let duration be the value returned by running the convert a mark to a timestamp algorithm passing in duration.
      const duration = convertMarkToTimestamp(startOrMeasureOptions.duration);
      // 2.3.3. Let end time be start plus duration.
      endTime = start + duration;
    } // 2.4. Otherwise, let end time be the value that would be returned by the Performance object's now() method.
    else {
      endTime = performance.now();
    }
  } // 2.4. Otherwise, let end time be the value that would be returned by the Performance object's now() method.
  else {
    endTime = performance.now();
  }

  // 3. Compute start time as follows:
  // 3.1. If startOrMeasureOptions is a PerformanceMeasureOptions object, and if its start member exists, let start time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions's start.
  if (isOptions(startOrMeasureOptions)) {
    if (startOrMeasureOptions.start !== undefined) {
      startTime = convertMarkToTimestamp(startOrMeasureOptions.start);
    } // 3.2. Otherwise, if startOrMeasureOptions is a PerformanceMeasureOptions object, and if its duration and end members both exist:
    else if (
      startOrMeasureOptions.duration !== undefined &&
      startOrMeasureOptions.end !== undefined
    ) {
      // 3.2.1. Let duration be the value returned by running the convert a mark to a timestamp algorithm passing in duration.
      const duration = convertMarkToTimestamp(startOrMeasureOptions.duration);
      // 3.2.2. Let end be the value returned by running the convert a mark to a timestamp algorithm passing in end.
      const end = convertMarkToTimestamp(startOrMeasureOptions.end);
      // 3.2.3. Let start time be end minus duration.
      startTime = end - duration;
    }
  } // 3.3. Otherwise, if startOrMeasureOptions is a DOMString, let start time be the value returned by running the convert a mark to a timestamp algorithm passing in startOrMeasureOptions.
  else if (typeof startOrMeasureOptions === "string") {
    startTime = convertMarkToTimestamp(startOrMeasureOptions);
  } // 3.4. Otherwise, let start time be 0.
  else {
    startTime = 0;
  }

  if (startTime === undefined || endTime === undefined) {
    throw new TypeError("Invalid startTime or endTime");
  }

  // 4. Create a new PerformanceMeasure object (entry) with this's relevant realm.
  const entry = {
    // 5. Set entry's name attribute to measureName.
    name: measureName,
    // 6. Set entry's entryType attribute to DOMString "measure".
    entryType: "measure",
    // 7. Set entry's startTime attribute to start time.
    startTime,
    // 8. Set entry's duration attribute to the duration from start time to end time. The resulting duration value MAY be negative.
    duration: endTime - startTime,
    // 9. Set entry's detail attribute as follows:
    detail: isOptions(startOrMeasureOptions)
      ? startOrMeasureOptions.detail ?? null
      : null,
    toJSON() {
      return {
        name: this.name,
        entryType: this.entryType,
        startTime: this.startTime,
        duration: this.duration,
        detail: this.detail,
      };
    },
  };

  // 10. Queue entry.
  // TODO

  // 11. Add entry to the performance entry buffer.
  // TODO

  // 12. Return entry.
  return entry;
}