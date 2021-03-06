import { useState, useCallback} from 'react'
import { Button, Divider, List, ListItem, IconButton, ListItemButton, ListItemText, Popover } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

const SortButton = ({options = [{label: 'Episode', value: 'episode'}, {label: 'Year', value: 'year'}], onClick}) => {
  const [anchorEl, setAnchorEl] = useState(null)

  const handleClose = useCallback(() => {
    setAnchorEl(null)
  }, [])

  const handleClick = useCallback(value => {
    onClick(value)
    handleClose()
  }, [handleClose, onClick])

  return (
    <>
      <Button 
        variant="outlined"
        sx={{ backgroundColor: 'white' }}
        onClick={event => setAnchorEl(event.currentTarget)}
      >
        Sort&nbsp;By...
      </Button>
      <Popover 
        open={!!anchorEl}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
      <List
        sx={{width: 200}}
      >
        <ListItem dense>
          <ListItemText primary="Sort by" />
          <IconButton onClick={handleClose}><CloseIcon /></IconButton>
        </ListItem>
        <Divider />
        {options.map(({ label, value }) => 
          <ListItemButton 
            key={value} 
            onClick={() => handleClick(value)}
          >
            <ListItemText primary={label} />
          </ListItemButton>
        )}
      </List>
      </Popover>
    </>
  )
}

export default SortButton
