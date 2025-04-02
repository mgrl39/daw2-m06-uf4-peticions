import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";

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
      // Fem una peticio GET a l'API utilitzant axios. 
      // Axios reetorna un objecte de tipus AxiosResponse amb molta informació. (data, status, headers...)
      const response = await axios.get(API_URL);
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
      // Si no hi ha ID, no es fa res.
      if (!objectId.trim()) return;
      // Fem una peticio GET a l'endpoint especific. Concatenem el endpoint amb el ID.
      // L'ID l'agafem del input. Utilitzant el useState.
      const response : Response = await fetch(API_URL + "/" + objectId); // Podria ser `${API_URL}/${objectId}`
      // console.log(response);

      // Comprovacio de si la resposta es correcta (status 200)
      // Amb axios no cal fer aquesta comprovacio manual.
      // Axios ja tira errors si la resposta no es correcta.
      // Si no existeix s'executara.
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

      // Actualitzacio de la llista d'objectes per mostar unicament el recuperat.
      // setObjects espera un array de ModelObject. Com jo nomes vull mostrar un,
      // creeo un array amb el nou objecte. Es com un "envoltori" per contenir el nou objecte.
      setObjects([modelObj]);
    } catch (error) {
      // Si falla (api no respon, id no existeix, problema de connexio) entrem aqui.
      // Mostrem el missatge d'error a la consola.
      console.error("Error recuperant l'objecte amb ID " + objectId, error);
    }
  };

  const createObject = async () => {
    //TODO Crear un objecte per ID amb axios
    try {
      // He afegit una comprovacio per si l'input esta buit o no te 4 parts.
      if (!newObject.trim() || newObject.trim().split(",").length != 4) return;
      // if (Number.isNaN(Number(newObject.trim().split(",")[3]))) return;
      
      // Separacio de l'input en parts, es guarda a la llista de strings parts.
      const parts : string[] = newObject.split(",");

      // Creacio de l'objecte, aquest objecte no te ID perquè el backend l'assignarà.
      const myNewObjet : ModelObject = {
        name: parts[0]?.trim(),
        data: new ModelData(parts[1]?.trim(), parts[2]?.trim(), Number(parts[3]?.trim()))
      };

      // Peticio post amb axios.
      const response = await axios.post(API_URL, myNewObjet);
      console.log("Producte creat amb ID: " + response.data.id);

      // Actualitzem la llista d'objectes, posem await ja que despres d'haver creat
      // l'objecte, hem de refrescar la nostra llista d'objectes.
      await fetchObjects();

      // Resetejar el input
      setNewObject(""); 
    } catch (error) {
      console.error("Error creant l'objecte", error);
    }
  };

  const updateObject = async (id: string) => {
    //TODO Actualitzar un objecte per ID amb fetch
    // Es un put, aquest put quan es fa el canvi apareix l'objecte actualitzat 
    // a l'ultima posicio de la llista.
    if (!id.trim()) return;

    try {
      // Separacio de les dades de l'input en parts.
      const parts: string[] = newObject.trim().split(",");
      // Si no hi ha 4 parts, no es fa res.
      if (parts.length != 4) return;
      // if (Number.isNaN(Number(parts[3]?.trim()))) return;

      // Si estan tots els valors, es crea un objecte amb les dades.
      const objectToUpdate = {
        name: parts[0]?.trim() || "",
        data: {
          photo: parts[1]?.trim() || "",
          description: parts[2]?.trim() || "",
          price: Number(parts[3]?.trim()) || 0,
        },
      };
      
      const response : Response = await fetch(API_URL + "/" + id, {
        method: "PUT",
        // Sense els headers no podem dir-li que el body es un json. Per tant tira 415 Unsupported Media Type.
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(objectToUpdate),
      });
      // Si la resposta no es correcta, es mostra un missatge d'error.
      if (!response.ok) throw new Error("Error actualitzant l'objecte" + id);
      // Si la resposta es correcta, es mostra un missatge de confirmacio.
      console.log("Objecte amb ID " + id + " actualitzat");
      // Actualitzem la llista d'objectes.
      await fetchObjects();
    } catch (error) {
      // Si hi ha hagut algun error es mostra a la consola.
      console.error("Error actualitzant l'objecte amb ID " + id, error);
    }
  };

  const deleteObject = async (id: string) => {
    //TODO Eliminar un objecte per ID amb fetch o axios
    // Si no hi ha ID, no es fa res.
    if (!id.trim()) return;
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
