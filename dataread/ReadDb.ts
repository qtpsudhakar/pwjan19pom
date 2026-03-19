import mysql from 'mysql2'; // for new authonticaiton methods

class DBActions {

    private jsonResults: string = '';

    constructor() {

    }

    ReadDbAndReturnAsJson(): Promise<string> {

        // Create as async function to handle asynchronous database operations
        return new Promise<string>((resolve, reject) => {

            //create connection
            let connection = mysql.createConnection({
                host: 'localhost', //database host (server)
                user: 'root', //database user
                password: 'VibeTestQ', //database password
                database: 'company', //database name
                port: 3306 //database port number
            });

            connection.connect((err) => {
                if (err) {
                    console.error('Error connecting to the database:', err);
                    reject(err);
                    return;
                }
                console.log('Connected to the database!');
                // Execute a query to fetch data from the database
                connection.query('SELECT * FROM emp', (err, results) => {
                    if (err) {
                        console.error('Error executing query:', err);
                        reject(err);
                        return;
                    }
                    // console.log('Query results:', results);
                    // Convert results to JSON format
                    this.jsonResults = JSON.stringify(results);
                    // console.log('Query results in JSON format:', this.jsonResults);
                    // console.log('Results in JSON format:', this.jsonResults);
                    // Close the database connection
                    connection.end((err) => {
                        if (err) {
                            console.error('Error closing the database connection:', err);
                            reject(err);
                            return;
                        }
                        console.log('Database connection closed.');
                        resolve(this.jsonResults);

                    });

                });
            });
            // return this.jsonResults;
        });
    }
}
// let db = new DBActions();
// db.ReadDbAndReturnAsJson().then((results) => {
//     console.log(results);
// });



export { DBActions };


// Plain code to read from database and print results in JSON format
// import mysql from 'mysql2';
//create connection
// let myDb = mysql.createConnection({
//     host: 'localhost', //database host (server)
//     user: 'root', //database user
//     password: 'VibeTestQ', //database password
//     database: 'company', //database name
//     port: 3306 //database port number
// });

// // Connect to the database
// myDb.connect((err) => {
//     console.log('Connected to the database!');
//     // Execute a query to fetch data from the database
//     myDb.query('SELECT * FROM emp', (err, results) => {
        
//         console.log('Query results:', results);
//         // Close the database connection
//         myDb.end();
//         console.log('Database connection closed.');
//     });
// });