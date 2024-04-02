import {read, utils, WorkSheet} from 'xlsx';

export interface SheetItem {
  sheetName: string
  sheet: Array<Record<string, any>>
}


function fillMerges(ws: WorkSheet) {
  if (ws["!merges"]) {
    for (let merge of ws["!merges"]) {
      for (let i1 = merge.s.c; i1 <= merge.e.c; i1++) {
        for (let i2 = merge.s.r; i2 <= merge.e.r; i2++) {
          utils.sheet_add_aoa(
            ws,
            [[ws[utils.encode_col(merge.s.c) + utils.encode_row(merge.s.r)].v]],
            {origin: utils.encode_col(i1) + utils.encode_row(i2)}
          )
        }
      }
    }
  }
}

function convertFunction(ws: WorkSheet) {
  for (const row in ws) {
    if (ws[row]['t'] === 'z' && ws[row]['f'] !== undefined) {
      // console.log(ws[row]['f']);
      ws[row]['t'] = 'n';
    }
  }
}

export const tableFileReader = async (file: File): Promise<SheetItem[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      const result: Array<SheetItem> = [];
      reader.onload = (event) => {
        const data = event.target?.result;
        const wb = read(data, {
          type: 'binary',
          cellFormula: true,
          sheetStubs: true,
        });
        // console.log(wb);
        // console.log(wb.Sheets['月填报项'])
        // console.log(utils.sheet_to_formulae(wb.Sheets['月填报项']));
        // console.log(wb.Sheets['报表查询导出-排放活动水平数据']);
        wb.SheetNames.forEach((sheetName) => {
          console.log(sheetName);
          convertFunction(wb.Sheets[sheetName]);
          fillMerges(wb.Sheets[sheetName]);
          result.push({
            sheetName,
            sheet: utils.sheet_to_json(wb.Sheets[sheetName]),
          });
        });
        resolve(result);
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      reject(error);
    }
  });
};
