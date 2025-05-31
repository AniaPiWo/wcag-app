
// kolejkomat

const MAX_CONCURRENT_AUDITS = 2;

let runningAudits = 0;

interface QueuedAudit<T> {
  url: string;
  resolve: (value: T) => void;
  reject: (reason: Error) => void;
}

const auditQueue: QueuedAudit<unknown>[] = [];

export function queueAudit<T>(url: string, auditFn: (url: string) => Promise<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {

    auditQueue.push({
      url,
      resolve: resolve as (value: unknown) => void,
      reject
    });
    

    processQueue(auditFn);
  });
}

async function processQueue<T>(auditFn: (url: string) => Promise<T>): Promise<void> {

  if (auditQueue.length === 0 || runningAudits >= MAX_CONCURRENT_AUDITS) {
    return;
  }

  const nextAudit = auditQueue.shift();
  if (!nextAudit) return;
  
  runningAudits++;
  
  try {
    const result = await auditFn(nextAudit.url);
    
    nextAudit.resolve(result);
  } catch (error) {
    nextAudit.reject(error instanceof Error ? error : new Error(String(error)));
  } finally {
    runningAudits--;
    
    processQueue(auditFn);
  }
}
