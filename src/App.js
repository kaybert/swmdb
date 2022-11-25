import SearchIcon from "@mui/icons-material/Search";
import {
  Box,
  InputAdornment,
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
        first[key].localeCompare(second[key])
      );
      setMovies(sortedMovies);
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
          title,
          year: release_date,
          openingCrawl: opening_crawl,
          producer,
        })
      );
      setMovies(starWarsMovies);
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
          sx={{ flexBasis: "50%", borderRight: 1, borderColor: "lightgray" }}
        >
          <Table>
            <TableBody sx={{ cursor: "pointer" }}>
              {filteredMovies.map((movie) => (
                <TableRow
                  key={movie.id}
                  hover
                  onClick={() => setSelected(movie)}
                  selected={selected?.id === movie.id}
                >
                  <TableCell>{movie.episode}</TableCell>
                  <TableCell>{movie.title}</TableCell>
                  <TableCell align="right">{movie.year}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ position: "relative", flexBasis: "50%", padding: 3 }}>
          {selected ? (
            <>
              <Typography variant="h5" container="h2" gutterBottom>
                {selected.title}
              </Typography>
              <Typography paragraph gutterBottom>
                {selected.openingCrawl}
              </Typography>
              <Typography variant="body2">{`Directed by: ${selected.producer}`}</Typography>
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
