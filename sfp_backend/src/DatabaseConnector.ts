import mariadb from 'mariadb';

const pool = mariadb.createPool({
    host:"localhost",
    user:"root",
    password:"",
    connectionLimit:10,
    database:"sfp_database"
});

const QueryDatabase = (queryString: string, queryArgs: any) => {
    return new Promise<any>((resolve, reject) => {
        pool.getConnection().then(conn => {
            conn.query(queryString, queryArgs).then(queryRet => {
                conn.end();
                delete queryRet.meta;
                resolve(queryRet);
            }).catch(err => {
                conn.end();
                reject(err);
            });
        }).catch(err => {
            reject(err);
        });
    });
};

export {QueryDatabase};