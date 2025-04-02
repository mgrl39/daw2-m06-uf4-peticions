import { useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosResponse } from "axios";

import { ModelObject } from "../../models/ModelObject";
import { ModelData } from "../../models/ModelData";

import "./Home.css";

// TODO bdl ad shi
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
      // Fem una peticio GET a l'API utilitzant axios. 
      // Axios reetorna un objecte de tipus AxiosResponse amb molta informació. (data, status, headers...)
      const response: AxiosResponse<any, any> = await axios.get(API_URL);
      // console.log(response); // Per veure la resposta de la API a la consola
      
      // Llista inicialment buida on es guardaran els objectes que estem recuperant de la API.
      // Els objectes seran de tipus ModelObject.
      const objectsData: ModelObject[] = [];

      // A response.data hem rebut un array de jsons mes petits. Son les dades de cada objecte.
      // Cada json sera un modelObject. Dins de cada ModelObject hi ha un ModelData.
      for (const obj of response.data) {
        const modelObj: ModelObject = new ModelObject(
          obj.name,
          new ModelData(obj.data.photo, obj.data.description, obj.data.price),
          obj.id
        );
        // Després de crear el modelObject, l'afegim a la llista creada anteriorment.
        objectsData.push(modelObj);
      }
      // Utilitzem useState per poder veure a pantalla el resultat de la API.
      setObjects(objectsData);
    } catch (error) {
      // En el cas que hi hagi un error, el mostrem a la consola. 
      // Connexio, resposta incorrecta, etc.
      console.error(error);
    }
  };

  const fetchObjectById = async () => {
    //TODO Recuperar un objecte per ID amb fetch
    try {
      // Fem una peticio GET a l'endpoint especific. Concatenem el endpoint amb el ID.
      // L'ID l'agafem del input. Utilitzant el useState.
      const response = await fetch(API_URL + "/" + objectId); // Podria ser `${API_URL}/${objectId}`
      // console.log(response);

      // Comprovacio de si la resposta es correcta (status 200)
      // Amb axios no cal fer aquesta comprovacio manual.
      // Axios ja tira errors si la resposta no es correcta.
      if (!response.ok) throw new Error("Error al recuperar l'objecte amb ID: " + objectId);

      // Conversio de la resposta a JSOn per poder transformarla a ModelObject.
      // Amb axios no cal fer aquesta conversio manual.
      const obj = await response.json();

      // Transformacio de la resposta a Model
      const modelObj: ModelObject = new ModelObject(
        obj.name,
        new ModelData(obj.data.photo, obj.data.description, obj.data.price),
        obj.id
      );

      // Actualitzacio de la llista d'objectes per mostrar el nou objecte.
      // setObjects espera un array de ModelObject. Com jo nomes vull mostrar un,
      // creeo un array amb el nou objecte. Es com un "envoltori" per contenir el nou objecte.
      setObjects([modelObj]);
    } catch (error) {
      // Si falla (api no respon, id no existeix, problema de connexio) entrem aqui.
      // Mostrem el missatge d'error a la consola.
      console.error(error);
    }
  };

  const createObject = async () => {
    //TODO Crear un objecte per ID amb axios
    try {
      // He afegit una comprovacio per si l'input esta buit o no te 4 parts.
      if (!newObject.trim() || newObject.trim().split(",").length != 4) return;
      
      // Separacio de l'input en parts, es guarda a la llista de strings parts.
      const parts : string[] = newObject.split(",");

      // Creacio de l'objecte, aquest objecte no te ID perquè el backend l'assignarà.
      const myNewObjet : ModelObject = {
        name: parts[0]?.trim(),
        data: new ModelData(parts[1]?.trim(), parts[2]?.trim(), Number(parts[3]?.trim()))
      };

      // Peticio post amb axios.
      const response : AxiosResponse<any, any> = await axios.post(API_URL, myNewObjet);
      console.log("Producte creat amb ID: " + response.data.id);

      // Actualitzem la llista d'objectes, posem await ja que despres d'haver creat
      // l'objecte, hem de refrescar la nostra llista d'objectes.
      await fetchObjects();

      // Resetejar el input
      setNewObject(""); 
    } catch (error) {
      console.error(error);
    }
  };

  const updateObject = async (id: string) => {
    //TODO Actualitzar un objecte per ID amb fetch
    // Es un put, cuando hacemos el actaulizar tenemos que guardar los datos
    // El input esta preparado para recibir un string plano.
    // Por como funciona la api y la aplicacion si ponemos solo un valor la api va a seguir fnucionando igual.
    // La aplicacion debe ser capaz de si metemos los 4 valors los pone los 4
    if (!id) return;

    try {
      const response = await fetch(API_URL + "/" + id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newObject,
          data: {
            photo: newObject,
            description: newObject,
            price: newObject,
          },
        }),
      });
      if (!response.ok) throw new Error("Error actualitzant l'objecte" + id);
      console.log("objecte" + id + " actualitzat");
      fetchObjects();
    } catch (error) {
      console.error("Error actualitzant l'objecte", error);
    }
  };

  const deleteObject = async (id: string) => {
    //TODO Eliminar un objecte per ID amb fetch o axios
    // Si no hi ha ID, no es fa res.
    if (!id) return;
    try {
      // Peticio delete a l'API utilitzant axios
      await axios.delete(API_URL + "/" + id);
      // Axios si falla tira errors, si arriba aqui es que s'ha esborrat be
      console.log("Objecte amb ID " + id + " esborrat correctament")
      // Utilitzacio del endpoint /objects per "resfrescar" la llista
      await fetchObjects();
    } catch (error) {
      // Si hi ha hagut algun error es mostra a la consola.
      console.error("Error esborrant l'objecte amb ID" + id, error);
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
