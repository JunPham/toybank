import { enablePromise, openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { transactionHistory } from './models';

const tableName = 'transactionData';

enablePromise(true);

export const getDBConnection = async () => {
  return openDatabase({ name: 'toybank.db', location: 'default' });
};

export const createTable = async (db: SQLiteDatabase) => {
  // create table if not exists
  const query = `CREATE TABLE IF NOT EXISTS ${tableName}(
        value TEXT NOT NULL
    );`;

  await db.executeSql(query);
};

export const getTxn = async (db: SQLiteDatabase): Promise<transactionHistory[]> => {
  try {
    const Txn: transactionHistory[] = [];
    const results = await db.executeSql(`SELECT * FROM ${tableName}`);
    results.forEach(result => {
      for (let index = 0; index < result.rows.length; index++) {
        Txn.push(result.rows.item(index))
      }
    });
    return Txn;
  } catch (error) {
    console.error(error);
    throw Error('Failed to get data !!!');
  }
};

export const saveData = async (db: SQLiteDatabase, Txn: transactionHistory[]) => {
  const insertQuery =
    `INSERT OR REPLACE INTO ${tableName}(rowid, value) values` +
    Txn.map(i => `(${i.id}, '${i.value}')`).join(',');

  return db.executeSql(insertQuery);
};

export const deleteTodoItem = async (db: SQLiteDatabase, id: number) => {
  const deleteQuery = `DELETE from ${tableName} where rowid = ${id}`;
  await db.executeSql(deleteQuery);
};

export const deleteTable = async (db: SQLiteDatabase) => {
  const query = `drop table ${tableName}`;

  await db.executeSql(query);
};