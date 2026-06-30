import { useEffect, useState } from "react"
import Search from "./components/search.jsx";
import Spinner from "./components/Spinner.jsx";
import MovieCard from "./components/moviecard.jsx";
import { useDebounce } from "react-use";
import { getTrendingMovies, updateSearchCount } from "./appwrite.js";

const API_BASE_URL = "https://api.themoviedb.org/3";

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [debouncedsearchterm, setdebouncedsearchterm] = useState('');
  const [searchTerm, setsearchTerm] = useState('');
  const [movielist, setmovielist] = useState([]);
  const [errormessage, seterrormessage] = useState('');
  const [isloading, setisloading] = useState(false);
  const [trendingMovies, setTrendingMovies] = useState([]);

  useDebounce(() => setdebouncedsearchterm(searchTerm), 500, [searchTerm]);

  const fetchmovies = async (query = '') => {
    setisloading(true);
    seterrormessage('');

    try {
      const endpoint = query ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}` : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error('failed to fetch movies');
      }

      const data = await response.json();

      if (data.response == 'False') {
        seterrormessage(data.Error || 'Failed to fetch movies');
        setmovielist([]);
        return;
      }

      setmovielist(data.results || []);


      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error(`Error fetching movies: ${error}`);
      seterrormessage(' Error fetching movies, please try again later.');
    } finally {
      setisloading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();

      setTrendingMovies(movies)
    } catch (error) {
      console.error(`error fetching trending movies: ${error}`);
    }
  }

  useEffect(() => {
    fetchmovies(debouncedsearchterm);
  }, [debouncedsearchterm]);

  useEffect(() => {
    loadTrendingMovies();
  }, []);

  return (
    <main>

      <div className="pattern" />

      <div className="wrapper">
        <header>
          <img src="./hero-img.png" alt="Hero Banner" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Enjoy without the hastle
          </h1>

          <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm} />
        </header>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title} />
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="all_movies">
          <h2>All Movies</h2>

          {isloading ? (
            <Spinner />
          ) : errormessage ? (
            <p className="text-red-500">{errormessage}</p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {movielist.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </ul>
          )}
        </section>

      </div>
    </main>
  )
}

export default App
