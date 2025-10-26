"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLighthouse } from "@/hooks/useLighthouse";
import { Loader2, Download, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RetrieveSnapshot() {
  const { retrieveData, isUploading } = useLighthouse();
  const [ipfsHash, setIpfsHash] = useState("");
  const [retrievedData, setRetrievedData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleRetrieve = async () => {
    if (!ipfsHash.trim()) {
      setError("Please enter an IPFS hash");
      return;
    }

    setError(null);
    setRetrievedData(null);

    try {
      const data = await retrieveData(ipfsHash.trim());
      setRetrievedData(data);
      console.log("Retrieved snapshot data:", data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to retrieve data");
    }
  };

  const downloadAsJSON = () => {
    if (!retrievedData) return;

    const dataStr = JSON.stringify(retrievedData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `snapshot-${ipfsHash.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          <Download className="mr-2 h-4 w-4" />
          Retrieve from IPFS
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Retrieve Snapshot from IPFS</DialogTitle>
          <DialogDescription>
            Enter the IPFS hash to retrieve your encrypted snapshot data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ipfs-hash">IPFS Hash (CID)</Label>
            <Input
              id="ipfs-hash"
              placeholder="Qm... or bafy..."
              value={ipfsHash}
              onChange={(e) => setIpfsHash(e.target.value)}
              disabled={isUploading}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleRetrieve}
            disabled={isUploading || !ipfsHash.trim()}
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Retrieving...
              </>
            ) : (
              "Retrieve Data"
            )}
          </Button>

          {retrievedData && (
            <div className="space-y-4 mt-6 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold">Retrieved Data</h3>
                <Button variant="outline" size="sm" onClick={downloadAsJSON}>
                  Download JSON
                </Button>
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Snapshot Root:</p>
                    <code className="text-xs break-all">
                      {retrievedData.snapshotRoot?.slice(0, 20)}...
                    </code>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance Entries:</p>
                    <p className="font-semibold">
                      {retrievedData.balanceEntries?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Price Entries:</p>
                    <p className="font-semibold">
                      {retrievedData.priceEntries?.length || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Balance Root:</p>
                    <code className="text-xs break-all">
                      {retrievedData.balanceTree?.root?.slice(0, 20)}...
                    </code>
                  </div>
                </div>
              </div>

              <Alert>
                <AlertDescription className="text-xs">
                  ✅ Data successfully retrieved from IPFS. You can now use this
                  merkle data to generate proofs for any balance or price entry.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
