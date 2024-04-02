import { useState } from 'react'
import './App.css'
import { useFileUpload } from 'use-file-upload';
import {tableFileReader} from "./xlsx/xlsxReader.ts";
import {xlsxConfigDecoder} from "./xlsx/xlsxConfigDecoder.ts";
import ReactJson from 'react-json-view'

function App() {
  const [_, selectFile] = useFileUpload();

  const [sheets, setSheets] = useState<any[]>([]);

  return (
    <>
      <button
        onClick={() => {
          selectFile({accept: '.xlsx', multiple: false}, async (file) => {
            const sheets =  await tableFileReader(file.file);
            // console.log(sheets);
            setSheets(sheets);
            xlsxConfigDecoder(sheets);
          });
        }}
      >
        Import xlsx
      </button>
      <h2>
        Full sheets
      </h2>
      <ReactJson src={sheets} />
      <h2>
        Templates
      </h2>
      <ReactJson src={xlsxConfigDecoder(sheets)}/>
    </>
  )
}

export default App
