import {SheetItem} from '@/components/xlsx/xlsxReader';

export const XLSX_CONFIG_DECODER = '配置项';
export const XLSX_CONFIG_DECODER_REGEX = /配置项（(.*)）/;

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace XLSXConfig {
  export const XLSX_CONFIG_CLASS = '所属类';
  export const XLSX_CONFIG_CATEGORY = '核算大类';
  export const XLSX_CONFIG_OBJECT = '排放项目';

  export const XLSX_CONFIG_UNIT = '单位';

  export const XLSX_CONFIG_IS_DEFAULT = '默认排放项';

  export interface ConfigNamespaceMap {
    [name: string]: ConfigNamespace;
  }

  export interface ConfigNamespace {
    name: string;
    items: ConfigClassMap;
  }

  export interface ConfigClassMap {
    [name: string]: ConfigClass
  }

  export interface ConfigClass {
    name: string;
    items: ConfigCategoryMap;
  }

  export interface ConfigCategoryMap {
    [name: string]: ConfigCategory;
  }

  export interface ConfigCategory {
    name: string;
    items: ConfigObjectMap;
  }

  export interface ConfigObjectMap {
    [name: string]: ConfigObject;
  }

  export interface ConfigObject {
    name: string;
    isDefault: boolean;
    unit?: string;
    keys?: ConfigObjectKeys;
  }

  export interface ConfigObjectKeys {
    [name: string]: string | number;
  }

  export const ConfigObjectKeysIgnore = [
    XLSX_CONFIG_CLASS,
    XLSX_CONFIG_CATEGORY,
    XLSX_CONFIG_OBJECT,
    XLSX_CONFIG_UNIT,
    XLSX_CONFIG_IS_DEFAULT,
  ];
}

export const xlsxConfigDecoder = (sheets: SheetItem[]) => {
  console.log(sheets);
  const configs = sheets.filter((sheet) => sheet.sheetName.startsWith(XLSX_CONFIG_DECODER));
  const configMap: XLSXConfig.ConfigNamespaceMap = {};
  for (const config of configs) {
    // name looks like "配置项（净购入能介）"
    const configMatch = config.sheetName.match(XLSX_CONFIG_DECODER_REGEX);
    const configName = configMatch ? configMatch[1] ?? '' : '';
    if (configName !== '') {
      const configNamespace: XLSXConfig.ConfigNamespace = {
        name: configName,
        items: {},
      }
      configMap[configName] = configNamespace;
      for (const row of config.sheet) {
        if (row[XLSXConfig.XLSX_CONFIG_CLASS]) {
          const configClass = row[XLSXConfig.XLSX_CONFIG_CLASS];
          const configCategory = row[XLSXConfig.XLSX_CONFIG_CATEGORY];
          const configObject = row[XLSXConfig.XLSX_CONFIG_OBJECT];
          const configUnit = row[XLSXConfig.XLSX_CONFIG_UNIT];
          const configIsDefault = row[XLSXConfig.XLSX_CONFIG_IS_DEFAULT];
          if (!!configClass && !!configCategory && !!configObject) {
            if (!configNamespace.items[configClass]) {
              configNamespace.items[configClass] = {
                name: configClass,
                items: {}
              }
            }
            if (!configNamespace.items[configClass].items[configCategory]) {
              configNamespace.items[configClass].items[configCategory] = {
                name: configCategory,
                items: {}
              }
            }
            if (!configNamespace.items[configClass].items[configCategory].items[configObject]) {
              configNamespace.items[configClass].items[configCategory].items[configObject] = {
                name: configObject,
                unit: configUnit,
                isDefault: !!configIsDefault,
              }
            }
            // insert other keys
            for (const key in row) {
              if (!XLSXConfig.ConfigObjectKeysIgnore.includes(key)) {
                if (!configNamespace.items[configClass].items[configCategory].items[configObject].keys) {
                  configNamespace.items[configClass].items[configCategory].items[configObject].keys = {};
                }
                // @ts-ignore
                configNamespace.items[configClass].items[configCategory].items[configObject].keys[key] = row[key];
              }
            }
            // console.log(row);
          }
        }
      }
    }
  }
  console.log(configMap);
  console.log(JSON.stringify(configMap, null, 2));
  return configMap;
};
