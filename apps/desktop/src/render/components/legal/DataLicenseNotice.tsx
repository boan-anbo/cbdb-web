import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/render/components/ui/dialog';
import { Button } from '@/render/components/ui/button';
import { ShieldCheck } from 'lucide-react';

const STORAGE_KEY = 'cbdb:dataLicenseAcknowledgedAt';

export function DataLicenseNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const ack = localStorage.getItem(STORAGE_KEY);
      if (!ack) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const acknowledge = () => {
    try {
      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
    } catch {}
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            Data License Notice
          </DialogTitle>
          <DialogDescription>
            This app includes or uses CBDB data. The software is open‑source, but CBDB data is licensed separately by the
            China Biographical Database Project. In mainland China, CBDB granted an exclusive commercial license to ChineseAll.com beginning in 2018.
          </DialogDescription>
        </DialogHeader>

        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            Please review CBDB licensing before any use, especially commercial:
            {' '}<a className="underline" href="https://projects.iq.harvard.edu/cbdb/exclusive-commercial-license" target="_blank" rel="noreferrer">CBDB licensing</a>.
          </p>
          <p>
            CBDB homepage: {' '}<a className="underline" href="https://projects.iq.harvard.edu/cbdb" target="_blank" rel="noreferrer">projects.iq.harvard.edu/cbdb</a>.
          </p>
          <p>
            How to cite CBDB: Harvard University, Academia Sinica, and Peking University, China Biographical Database (May 2025),
            {' '}<a className="underline" href="https://projects.iq.harvard.edu/cbdb" target="_blank" rel="noreferrer">https://projects.iq.harvard.edu/cbdb</a>.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" asChild>
            <a href="https://projects.iq.harvard.edu/cbdb/exclusive-commercial-license" target="_blank" rel="noreferrer">View CBDB License</a>
          </Button>
          <Button onClick={acknowledge}>I Understand</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DataLicenseNotice;

