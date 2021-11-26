import { useState, useEffect, useCallback } from 'react'
import { Box, TextField, Typography, Toolbar, Table, TableBody, TableRow, TableCell, InputAdornment } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search';
import SortButton from './SortButton'

/* 
  In all my application I always build them with functional components.
  The introduction of React hooks have made class componentes a thing of the past.
*/
const App = () => {
  const [selected, setSelected] = useState()
  const [movies, setMovies] = useState([])
  const [filter, setFilter] = useState('')
  const [filteredMovies, setFilteredMovies] = useState([])

  /* 
    This is the sorting function. Maybe a more streamlined solution for sorting would be to set sortBy as a state and
    do the sorting update in a useEffect, similar to filter.
    But I went with this callback approach to spice it up with different solutions.
  */
  const sortBy = useCallback(key => {
    const sortedMovies = [...movies ].sort((first, second) => 
      first[key].localeCompare(second[key])
    )
    setMovies(sortedMovies)
  }, [movies])

  /*
    This is where the api request is made just after componentDidMount
    I went with an async IIFE technique when fetching to make the code more procedural which in my opinion makes the code easier to read.
    A more common solution would be to use the .then() method.
    Something I have not taken into account yet is error handling. A TODO to this application is adding some error messages to the user.
  */
  useEffect(() => {
    (async () => {
      const response = await fetch('https://star-wars-api.herokuapp.com/films')
      if (!response.ok)
        return
      const data = await response.json()
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
      )
      setMovies(starWarsMovies)
    })()
  }, [])

  useEffect(() => {
    const escapedString = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regExFilter = new RegExp(escapedString, 'i')
    const filteredMovies = movies.filter(movie => regExFilter.test(movie.title))
    setFilteredMovies(filteredMovies)
  }, [filter, movies])

  useEffect(() => {
    filteredMovies.some(movie => movie.id === selected?.id) || setSelected(null)
  }, [filteredMovies, selected?.id])
  /* 
    I chose to build the ui with the help of the Material UI library because of its rich and well documented component library.
    I also had in mind to divide this main App component into smaller parts. e.g. extract the Table which lists the movies into its own component.
    But decided not to because of the small size of this application.
   
    The SortButton ended up as a component to separate its Popover logic.
  */
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <Toolbar sx={{ gap: 2 , backgroundColor: '#f5f5f5', borderBottom: '1px solid lightgray' }}>
        <SortButton onClick={sortBy} />
        <TextField
          size="small"
          type="search"
          sx={{ flexGrow: 1 }}
          value={filter}
          onChange={event => setFilter(event.target.value)}
          InputProps={{
            placeholder: 'Type to filter...',
            startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
            sx: { backgroundColor: 'white' }
          }}
        />
      </Toolbar>
      <Box sx={{display: 'flex', alignItems: 'stretch', flexGrow: '1'}}>
        <Box sx={{ flexBasis: '50%', borderRight: 1, borderColor: 'lightgray'}}>
          <Table >
            <TableBody sx={{cursor: 'pointer'}}>
              {filteredMovies.map((movie) => 
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
              )}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ position: 'relative', flexBasis: '50%', padding: 3 }}>
          {selected ? 
            <>
              <Typography variant="h5" container="h2" gutterBottom>{selected.title}</Typography>
              <Typography paragraph gutterBottom>{selected.openingCrawl}</Typography>
              <Typography variant="body2">{`Directed by: ${selected.producer}`}</Typography>
            </> 
            : 
              <Typography sx={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', fontWeight: 'bold'}}>
                No Movie Selected
              </Typography>
          }
        </Box>
      </Box>
    </Box>
  )
}

export default App
