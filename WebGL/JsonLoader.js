
class JsonLoader{
    constructor(){
        this.geomJsonData;
        this.VATJsonData = [];
        this.VATJsonData[0] = [];
        this.VATJsonData[1] = [];
        this.position = [];
        this.vertexIndex = [];
        this.vertexID = [];
    }

    load(){
        this.jsonPromises = [];
        this.jsonPath = assetsPath + 'WebGL/Geometry.json';
        this.jsonPromises[0] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data => {
            this.geomJsonData = data;
        });

        //Mid1
        this.jsonPath = assetsPath + 'WebGL/VAT1_Mid1.json'
        this.jsonPromises[1] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[0][0] = data;
        });
        //End1
        this.jsonPath = assetsPath + 'WebGL/VAT1_End1.json'
        this.jsonPromises[2] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[0][1] = data;
        });

        //Mid2
        this.jsonPath = assetsPath + 'WebGL/VAT2_Mid1.json'
        this.jsonPromises[3] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][0] = data;
        });
        //End2
        this.jsonPath = assetsPath + 'WebGL/VAT2_End1.json'
        this.jsonPromises[4] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][1] = data;
        });

        //End3
        this.jsonPath = assetsPath + 'WebGL/VAT2_End2.json'
        this.jsonPromises[5] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][2] = data;
        });

        return Promise.all(this.jsonPromises);
    }

    loadA(){
        this.jsonPromises = [];
        this.jsonPath = assetsPath + 'WebGL/Geometry.json';
        this.jsonPromises[0] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data => {
            this.geomJsonData = data;
        });

        //Mid1
        this.jsonPath = assetsPath + 'WebGL/VAT1_Mid1.json'
        this.jsonPromises[1] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[0] = data;
        });
        //End1
        this.jsonPath = assetsPath + 'WebGL/VAT1_End1.json'
        this.jsonPromises[2] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1] = data;
        });
        return Promise.all(this.jsonPromises);
    }

    loadB(){
        this.jsonPromises = [];
        this.jsonPath = assetsPath + 'WebGL/Geometry.json';
        this.jsonPromises[0] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data => {
            this.geomJsonData = data;
        });

        //Mid2
        this.jsonPath = assetsPath + 'WebGL/VAT2_Mid1.json'
        this.jsonPromises[1] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][0] = data;
        });
        //End2
        this.jsonPath = assetsPath + 'WebGL/VAT2_End1.json'
        this.jsonPromises[2] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][1] = data;
        });
        return Promise.all(this.jsonPromises);
    }

    loadC(){
        this.jsonPromises = [];
        this.jsonPath = assetsPath + 'WebGL/Geometry.json';
        this.jsonPromises[0] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data => {
            this.geomJsonData = data;
        });

        //Mid2
        this.jsonPath = assetsPath + 'WebGL/VAT2_Mid1.json'
        this.jsonPromises[1] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][0] = data;
        });
    
        //End3
        this.jsonPath = assetsPath + 'WebGL/VAT2_End2.json'
        this.jsonPromises[2] = fetch(this.jsonPath)
            .then(response => response.json())
            .then(data =>{
                this.VATJsonData[1][2] = data;
        });

        return Promise.all(this.jsonPromises);
    }

}
