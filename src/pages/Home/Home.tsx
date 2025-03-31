import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";

import { ModelObject } from "../../models/ModelObject";
import { ModelData } from "../../models/ModelData";

import "./Home.css";

const API_URL = "http://192.168.238.42:8080/objects"; //S'ha de canviar localhost per la IP correcte

function Home() {
  const [objects, setObjects] = useState<ModelObject[]>([]); //Lista dels objectes a mostrar
  const [newObject, setNewObject] = useState<string>(""); //Control de l'input de les dades d'objecte
  const [objectId, setObjectId] = useState<string>(""); //Control de l'input de ID

  useEffect(() => {
    fetchObjects();
  }, []);

  const fetchObjects = async () => {
    //TODO Recuperar tots els objectes amb axios
    try {
      const response: AxiosResponse<any, any> = await axios.get(API_URL);
      const objectsData = response.data.map((obj: any): ModelObject =>
        new ModelObject(obj.name, new ModelData(obj.data.photo, obj.data.description, obj.data.price), obj.id)
      );
      setObjects(objectsData);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchObjectById = async () => {
    //TODO Recuperar un objecte per ID amb fetch
    try {
      const response = await fetch(API_URL + "/" + objectId)
      if (!response.ok) throw new Error("Error al recuperar l'objecte");
      console.log(response);
      setObjects(objects.filter(obj => obj.id === objectId));
    } catch (error) {
      console.error(error);
    }
  };


  const createObject = async () => {
    //TODO Crear un objecte per ID amb axios
    axios.post(API_URL, {

    });
    //.then(())
  };

  const updateObject = async (id: string) => {
    //TODO Actualitzar un objecte per ID amb fetch
    // Es un put, cuando hacemos el actaulizar tenemos que guardar los datos
    // El input esta preparado para recibir un string plano.
    // Por como funciona la api y la aplicacion si ponemos solo un valor la api va a seguir fnucionando igual.
    // La aplicacion debe ser capaz de si metemos los 4 valors los pone los 4
    if (!id) return;
  };


  const deleteObject = async (id: string) => {
    //TODO Eliminar un objecte per ID amb fetch o axios
    if (!id) return;
    try {
      await axios.delete(API_URL + "/" + id);
      console.log(id + " esborrat");
      setObjects(objects.filter(obj => obj.id !== id));
    }
    catch (error) {
      console.error("Error esborrant l'objecte", error);
    }
    finally {
      fetchObjects();
    }
  };

  //Actualitzar el valor de l'objecte de l'input
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNewObject(e.target.value);
  };

  //Actualitzar el valor de l'ID de l'input
  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setObjectId(e.target.value);
  };

  return (
    <div className="container">
      <h1>Online Store</h1>
      <div className="input-group">
        <input
          type="text"
          placeholder="Nom, foto, descripció, preu"
          value={newObject}
          onChange={handleInputChange}
        />
        <button onClick={createObject}>Crear producte</button>
      </div>
      <div className="input-group">
        <input
          type="text"
          placeholder="ID producte"
          value={objectId}
          onChange={handleIdChange}
        />
        <button onClick={fetchObjectById}>Buscar per ID</button>
      </div>
      <button className="refresh-btn" onClick={fetchObjects}>
        Mostrar tots els productes
      </button>
      <div className="object-list">
        {objects.map((obj) => (
          <div key={obj.id} className="object-card">
            <img src={obj.data.photo} alt={obj.name} className="object-photo" />
            <div className="object-details">
              <h2>{obj.name}</h2>
              <p>{obj.data.description}</p>
              <p className="object-price">{obj.data.getFormattedPrice()}</p>
              <button onClick={() => updateObject(obj.id!)}>Actualitzar</button>
              <button
                className="delete-btn"
                onClick={() => deleteObject(obj.id!)}
              >
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
