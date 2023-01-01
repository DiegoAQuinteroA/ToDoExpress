const task = require('../models/task');

//este es el controlador
class TaskList{

    /**
     * Manejar APIs, despliega y maneja los tasks
     * @param {*} taskObjeto 
     */
    constructor(taskObjeto){
        this.taskObjeto = taskObjeto
    }

    async showTasks(req, res){
        const querySpec = {
            query: "SELECT * FROM root r WEHRE r.completed=@completed",
            parameter: {
                name: "@completed",
                value: false
            }
        }

        const items = await this.taskObjeto.find(querySpec);
        res.render("index", {
            title: "Mi lista de pendientes",
            tasks: items
        });
    }

    async addTask(req, res){
        const item = req.body;

        await this.taskObjeto.addItem(item);
        res.redirect('/');
    }

    async completeTask(req, res){
        const completeTask = Object.keys(req.body);
        const tasks = [];

        completeTask.forEach(tasks => {
            tasks.push(this.taskObjeto.updateItem(task));
        });

        await Promise.all(tasks);

        res.redirect("/");
    }
}

module.exports = TaskList;