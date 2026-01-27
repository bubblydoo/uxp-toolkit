import { useEffect, useState } from "react";

export function useEventListenerSkippable({
  subscribe,
  trigger,
  skip,
  filter,
}: {
  subscribe: (boundTrigger: () => void) => (() => void);
  trigger: () => void;
  /** If true, the trigger will be queued until the skip is false */
  skip: boolean;
  /** If false, the trigger will be skipped altogether */
  filter: boolean;
}) {
  const [queuedWhileSkipped, setQueuedWhileSkipped] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribe(() => {
      if (filter) {
        if (skip) {
          setQueuedWhileSkipped(true);
        } else {
          trigger();
        }
      }
    });
    return unsubscribe;
  }, [subscribe, trigger, skip, filter]);

  useEffect(() => {
    if (queuedWhileSkipped && !skip) {
      trigger();
      setQueuedWhileSkipped(false);
    }
  }, [queuedWhileSkipped, trigger, skip]);
}
