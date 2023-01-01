const CosmosClient = require('@azure/cosmos').CosmosClient //buscar algo en espesifico dentro de @azure/cosmos
const debug = require('debug')('todo-cosmos:task');

//clave de particion
let partitionkey = undefined;

//este es el modelo de datos
class Task{

    /**
     * lee, agrega y actualiza tareas en cosmosDB
     * @param {CosmosClient} CosmosClient 
     * @param {string} databaseID 
     * @param {string} containerID 
     */
    constructor(CosmosClient, databaseID, containeID){
        this.client = CosmosClient;
        this.databaseID = databaseID;
        this.containerID = containeID;

        this.database = null;
        this.container = null;
    }

    async init(){
        debug("Inicializando BD")

        const dbResponse = await this.client.databases.createIfNotExists({
            id: this.databaseID
        });
        
        this.database = dbResponse.database;
        debug("inicializando contenedor...");
        const contResponse = await this.database.containers.createIfNotExists({
            id: this.containerID
        });
        this.container = contResponse.container;
    }

    /**
     * Encuentra un objeto en la DB
     * @param {string} querySpec 
     */
    async find(querySpec){
        debug("buscando en la base de datos");

        if(!this.container){
            throw new Error("Container no se ha actualizado");
        }
        const { resources } = await this.container.items.query(querySpec).fetchAll();

        return resources;
    }

    /**
     * Crea el Item enviado en Cosmos DB
     * @param {*} item 
     * @returns {resources} item creado en la DB
     */
    async addItem(item){
        debug("Agregando item a la BD");

        item.date = Date.now();//agrega la fecha actual al item creado
        item.completed = false;
        const { resources: doc } = await this.container.items.create(item);

        return doc;
    }

    /**
     * 
     * @param {string} itemID 
     * @returns 
     */
    async updateItem(itemID){
        debug('Actualizando ITEM');

        const doc = await this.getItem(itemID);
        doc.completed = true;

        const { resource: replaced } = await this.container.item(itemID, partitionkey).replaced(doc);
        
        return replaced;
    }

    /**
     * 
     * @param {string} itemID 
     * @returns 
     */
    async getItem(itemID){
        debug("'buscando ITEM en la DB");

        const { resource } = await this.container.item(itemID, partitionkey);

        return resource;
    }
}

module.exports = Task;