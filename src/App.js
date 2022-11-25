import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  Chip,
  InputAdornment,
  Rating,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import SortButton from "./SortButton";

const App = () => {
  const [selected, setSelected] = useState();
  const [movies, setMovies] = useState([]);
  const [filter, setFilter] = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);

  const sortBy = useCallback(
    (key) => {
      const sortedMovies = [...movies].sort((first, second) =>
        ("" + first[key]).localeCompare("" + second[key])
      );
      setMovies(
        key === "averageRating" ? sortedMovies.reverse() : sortedMovies
      );
    },
    [movies]
  );

  useEffect(() => {
    (async () => {
      const response = await fetch("https://star-wars-api.herokuapp.com/films");
      if (!response.ok) return;
      const data = await response.json();
      const starWarsMovies = data.map(
        ({
          id,
          fields: { release_date, title, episode_id, opening_crawl, producer },
        }) => ({
          id,
          episode: `EPISODE ${episode_id}`,
          title: title.replace("1", "I"),
          year: release_date,
          openingCrawl: opening_crawl,
          producer,
        })
      );
      setMovies(starWarsMovies);

      const url = "https://www.omdbapi.com/";

      (async () => {
        let moviesWithMeta = await Promise.all(
          starWarsMovies?.map(async (movie) => {
            const link = `${url}?t=${movie.title}&apikey=2a1ad4b`;
            let response = await fetch(link);
            let { Ratings, Poster } = await response.json();
            const ratings = Ratings.map(({ Source, Value }) => ({
              source: Source,
              value: Value.replace(/(\.|%|\/\d+)/g, ""),
            }));

            return {
              ...movie,
              ratings: ratings,
              averageRating: calcAverage(ratings),
              posterUrl: Poster,
            };
          })
        );
        setMovies(moviesWithMeta);
      })();
    })();
  }, []);

  useEffect(() => {
    const escapedString = filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regExFilter = new RegExp(escapedString, "i");
    const filteredMovies = movies.filter((movie) =>
      regExFilter.test(movie.title)
    );
    setFilteredMovies(filteredMovies);
  }, [filter, movies]);

  useEffect(() => {
    filteredMovies.some((movie) => movie.id === selected?.id) ||
      setSelected(null);
  }, [filteredMovies, selected?.id]);

  const calcAverage = (ratings) => {
    let sum = 0;
    for (const rating of ratings) {
      sum += +rating.value;
    }
    console.log(Math.floor(sum / ratings.length / 10));
    return Math.floor(sum / ratings.length / 10);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Toolbar
        sx={{
          gap: 2,
          backgroundColor: "#f5f5f5",
          borderBottom: "1px solid lightgray",
        }}
      >
        <SortButton onClick={sortBy} />
        <TextField
          size="small"
          type="search"
          sx={{ flexGrow: 1 }}
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          InputProps={{
            placeholder: "Type to filter...",
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { backgroundColor: "white" },
          }}
        />
      </Toolbar>
      <Box sx={{ display: "flex", alignItems: "stretch", flexGrow: "1" }}>
        <Box
          sx={{
            flexBasis: "50%",
            borderRight: 1,
            borderColor: "lightgray",
          }}
        >
          <Table>
            <TableBody sx={{ cursor: "pointer" }}>
              {filteredMovies.map((movie) => (
                <TableRow
                  key={movie.id}
                  hover
                  onClick={() => {
                    console.log(selected);
                    setSelected(movie);
                  }}
                  selected={selected?.id === movie.id}
                >
                  <TableCell>{movie.episode}</TableCell>
                  <TableCell>{movie.title}</TableCell>
                  <TableCell align="right">
                    <Rating
                      name="Average rating"
                      value={Number(movie.averageRating)}
                      precision={0.5}
                      max={10}
                      size="small"
                      readOnly
                    />
                  </TableCell>

                  <TableCell align="right">{movie.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box
          sx={{
            position: "relative",
            flexBasis: "50%",
            padding: 3,
            flexWrap: "wrap",
          }}
        >
          {selected ? (
            <>
              <Typography variant="h5" container="h2" gutterBottom>
                {selected.title}
              </Typography>
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginBottom: "10px",
                }}
              >
                <div>
                  <img style={{ width: "150px" }} src={selected.posterUrl} />
                </div>
                <Typography paragraph gutterBottom>
                  {selected.openingCrawl}
                </Typography>
              </div>
              <Typography>{`Directed by: ${selected.producer}`}</Typography>

              <div
                style={{
                  marginTop: "10px",
                  textAlign: "center",
                  display: "flex",
                }}
              >
                <Typography>Average rating:</Typography>
                <Rating
                  sx={{ marginRight: "5px", marginLeft: "10px" }}
                  name="Average rating"
                  value={Number(selected.averageRating)}
                  precision={0.5}
                  max={10}
                  readOnly
                />
              </div>
              <div>
                {selected.ratings.map((rating) => (
                  <Chip
                    sx={{ margin: "10px", marginLeft: "0" }}
                    label={`${rating.source}: ${rating.value}%`}
                    variant="outlined"
                    color="info"
                    size="small"
                  />
                ))}
              </div>
            </>
          ) : (
            <Typography
              sx={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                fontWeight: "bold",
              }}
            >
              No Movie Selected
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default App;
