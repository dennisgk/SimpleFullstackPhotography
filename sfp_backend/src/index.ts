import express from 'express';
import graphql from 'graphql';
import { graphqlHTTP } from 'express-graphql';
import { sfp_schema } from './GraphSchema';
import { QueryDatabase } from './DatabaseConnector';
import { HandleGetPhoto, HandleGetServerInfo, HandleUploadPhoto } from './PhotoAccess/PhotoRetrieve';
import cors from 'cors';
import { ClearOldActiveSessions, ClearOldPendingUploads } from './Utilities/DatabasePeriodicManage';
import fileUpload from 'express-fileupload';
import bodyParser from 'body-parser';

const app = express();
const port = 8000;

app.use(cors());
app.use(fileUpload({
	createParentPath:true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use('/graph', graphqlHTTP({
	schema:sfp_schema,
	graphiql:false
}));

app.get('/photo', HandleGetPhoto);
app.post('/uploadPhoto', HandleUploadPhoto);
app.get('/serverInfo', HandleGetServerInfo);

app.listen(port, () => {
	console.log(`Express is listening at http://localhost:${port}`);
});

setInterval(() => {
	ClearOldActiveSessions();
	ClearOldPendingUploads();
}, 60 * 1000);