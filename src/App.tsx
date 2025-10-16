import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import "./index.css";
import { Button } from "./components/ui/button";
import { UploadIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Spinner } from "./components/ui/spinner";

export function App() {
  const fileInput = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | undefined>();
  const [isWaiting, setIsWaiting] = useState(false);

  const onButtonClick = () => {
    console.log(fileInput.current);
    fileInput.current?.click();
  };

  const convertFile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsWaiting(true);
    console.log(file);
    if (file && file.name.endsWith(".ipynb")) {
      const formData = new FormData();
      formData.append("name", file.name);
      formData.append("content", await file.text());
      const res = await fetch("/api/convert", {
        method: "POST",
        body: formData,
      });
      setIsWaiting(false);
      const data = await res.json();
      const pdfBase64 = data.body;
      const link = document.createElement("a");
      link.href = `data:application/pdf;base64,${pdfBase64}`;
      link.download = file.name.replace(".ipynb", ".pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <div className="grid place-items-center h-screen w-screen">
        <form
          onSubmit={convertFile}
          className="flex items-center flex-col gap-2"
        >
          <h1 className="text-3xl font-bold text-slate-800">
            Quarto to PDF converter
          </h1>
          <p className="pb-4">
            Carica un file <code>.ipynb</code> (Jupyter Notebook) e convertilo
            in PDF in{" "}
            <span className="line-through text-slate-500">pochi secondi</span>{" "}
            diverse decadi
          </p>
          <input
            ref={fileInput}
            onChange={(e) => setFile(e.target.files?.[0])}
            accept=".ipynb"
            type="file"
            hidden
          />
          <Button
            type="button"
            variant={"ghost"}
            disabled={isWaiting}
            size={"lg"}
            onClick={onButtonClick}
          >
            <UploadIcon />
            Carica file .ipynb
          </Button>
          {isWaiting ? (
            <Button disabled type="button" size={"lg"}>
              <Spinner />
              Sto convertendo (potrebbe volerci un po' di tempo...)
            </Button>
          ) : (
            <Button disabled={!file} type="submit" size={"lg"}>
              Converti in PDF
            </Button>
          )}
          <p>
            {file && (
              <>
                <b>file caricato: </b> {file.name}
              </>
            )}
          </p>
        </form>
      </div>
    </>
  );
}

export default App;
