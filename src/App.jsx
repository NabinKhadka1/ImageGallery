import "./styles.css";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import SearchImage from "/search.svg";

const accessKey = import.meta.env.VITE_API_KEY;
const baseURL = "https://api.unsplash.com/photos/";
const searchURL = "https://api.unsplash.com/search/photos/";
const clientID = `?client_id=${accessKey}`;

export default function App() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const display = useRef(false);
  const [newImage, setNewImage] = useState(false);
  console.log(page);

  const getPhotos = async () => {
    setLoading(true);

    const pageInfo = `&page=${page}`;
    const queryInfo = `&query=${searchText}`;
    let url;
    if (searchText) {
      url = `${searchURL}${clientID}${pageInfo}${queryInfo}`;
    } else {
      url = `${baseURL}${clientID}${pageInfo}`;
    }

    try {
      const response = await axios.get(url);
      setData((prevData) => {
        if (page === 1 && searchText) {
          return response.data.results;
        }
        // if (searchText) {
        //   if (page >= 2) {
        //     return [...prevData, ...response.data.results];
        //   }
        // }
        if (searchText) {
          return page >= 2
            ? [...prevData, ...response.data.results]
            : [...response.data.results];
        }
        else {
          return page >= 2
            ? [...prevData, ...response.data]
            : [...response.data];
        }
      });
      setNewImage(false);
      setLoading(false);
    } catch (error) {
      setNewImage(false);
      setLoading(false);
    }
  };
  useEffect(() => {
    getPhotos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  useEffect(() => {
    if (!display.current) {
      display.current = true;
      return;
    }
    if (!newImage) return;
    if (loading) return;
    setPage((prevPage) => prevPage + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newImage]);
  useEffect(() => {
    const scrollEvent = window.addEventListener("scroll", () => {
      if (
        !loading &&
        window.innerHeight + window.scrollY >= document.body.scrollHeight - 2
      ) {
        setNewImage(true);
      }
    });
    return () => window.removeEventListener("scroll", scrollEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitHandler = (e) => {
    e.preventDefault();
    if (!searchText) return;
    if (page === 1) {
      getPhotos();
    }
    setPage(1);
  };
  return (
    <main>
      <section>
        <form>
          <input
            className="search__input"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search"
          />
          <button className="btn" onClick={submitHandler}>
            <img className="search__image" src={SearchImage} alt="search" />
          </button>
        </form>
      </section>
      <section className="photos">
        {data?.map((photo) => (
          <article className="photo__article" key={photo?.id}>
            <img src={photo.urls?.thumb} alt={photo?.alt_description} />
            <div className="photo__info">
              <div className="photo__left">
                <h4>{photo.user?.name}</h4>
                <p>{photo.likes} likes</p>
              </div>
              <img
                className="photo__profile"
                src={photo.user?.profile_image.small}
                alt={photo.user?.name}
              />
            </div>
          </article>
        ))}
      </section>
      {loading && <div className="loading"></div>}
    </main>
  );
}
