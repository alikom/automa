import objectPath from 'object-path';
import { isObject, objectHasKey } from '@/utils/helper';

function parseKey(key) {
  const [dataKey, path] = key.split('@');

  if (dataKey === 'prevBlockData') return { dataKey, path: path || '0' };

  const pathArr = path.split('.');
  let dataPath = '';

  if (pathArr.length === 1) {
    dataPath = `${pathArr[0]}.0`;
  } else if (typeof +pathArr[0] !== 'number') {
    const firstPath = pathArr.shift();

    dataPath = `${firstPath}.0.${pathArr.join('.')}`;
  } else {
    const index = pathArr.shift();
    const firstPath = pathArr.shift();

    dataPath = `${firstPath}.${index}.${pathArr.join('.')}`;
  }

  if (dataPath.endsWith('.')) dataPath = dataPath.slice(0, -1);

  return { dataKey: 'data', path: dataPath };
}

export default function (block, data) {
  const replaceKeys = ['url', 'fileName', 'name', 'value'];

  replaceKeys.forEach((blockDataKey) => {
    if (!objectHasKey(block.data, blockDataKey)) return;

    const newDataValue = block.data[blockDataKey].replace(
      /\[(.+?)]/g,
      (match) => {
        const key = match.replace(/\[|]/g, '');
        const { dataKey, path } = parseKey(key);

        if (
          dataKey === 'prevBlockData' &&
          (!isObject(data.prevBlockData) || !Array.isArray(data.prevBlockData))
        ) {
          return data.prevBlockData;
        }

        return objectPath.get(data, `${dataKey}.${path}`) || match;
      }
    );

    block.data[blockDataKey] = newDataValue;
  });
}
