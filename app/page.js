'use client'
import Image from "next/image";
import { useState, useEffect } from "react";
import { firestore } from "../firebase";
import { Box, Typography, Modal, Stack, TextField, Button} from '@mui/material'
import { collection, doc, getDoc, getDocs, deleteDoc, setDoc, updateDoc, query } from "firebase/firestore";

export default function Home() {
  const [inventory, setInventory] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemname, setItemname] = useState("");

  const updateInventory = async () => {
    const snapshot = query(collection(firestore, 'inventory'));
    const docs = await getDocs(snapshot);
    const inventoryList = []
    docs.forEach((doc) => {
      inventoryList.push({
        name:doc.id,
        ...doc.data()
      });
    });
    setInventory(inventoryList);
    setItemname("");
    handleClose();
  }

  const removeItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      if (quantity > 1) {
        await updateDoc(docRef, {quantity: quantity - 1});
      }
      else{
        await deleteDoc(docRef);
      }
    }
    await updateInventory();
  }

  const addItem = async (item) => {
    const docRef = doc(collection(firestore, 'inventory'), item);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const {quantity} = docSnap.data();
      await updateDoc(docRef, {quantity: quantity + 1});
    }
    else{
      await setDoc(docRef, {quantity: 1});
    }
    await updateInventory();
  }

  useEffect(() => {
    updateInventory();
  }, []);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Box
      width={"100vw"}
      height={"100vh"}
      display="flex"
      flexDirection={"column"}
      justifyContent={"center"}
      alignItems={"center"}
      gap={2}
    >
      <Modal open={open} onClose={handleClose}>
        <Box
          position="absolute"
          top="50%"
          left={"50%"}
          width={400}
          bgcolor={"white"}
          border={"2px solid #000"}
          boxShadow={24}
          p={4}
          display={"flex"}
          flexDirection={"column"}
          sx={{transform: 'translate(-50%, -50%)'}}
        >
          <Typography variant="h6">
            Add Item
          </Typography>
          <Stack width="100%" direction="row" spacing={2}>
            <TextField
              variant="outlined"
              fullWidth
              placeholder="Item Name"
              value={itemname}
              onChange={(e) => setItemname(e.target.value)}
            />
            <Button variant="outlined" onClick={() => addItem(itemname)}>Add</Button>
          </Stack>
        </Box>
      </Modal>
      {/* <Typography variant="h1">
        Inventory Management
      </Typography> */}
      <Box border="1px solid #333">
        <Box 
          width="800px" 
          height="150px" 
          bgcolor="#ADD8E6" 
          display="flex"
          flexDirection="row"
          alignItems={"center"} 
          justifyContent={"space-between"}
          padding={5}
        >
          <Typography variant="h2" color="#333">Inventory</Typography>
          <Button variant="contained" onClick={handleOpen}>Add New Item</Button>
        </Box>
      
        <Stack width="800px" height="300px" spacing={2} overflow="auto">
          {inventory.map(({name, quantity}) => (
            <Box
              key={name}
              width="100%"
              minHeight={"150px"}
              display="flex"
              // flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
              bgcolor={"#f0f0f0"}
              padding={5}
            >
              <Typography variant="h3" color="#333" textAlign="center">
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Typography>
              <Typography variant="h3" color="#333" textAlign="center">
                {quantity}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={() => addItem(name)}>Add</Button>
                <Button variant="contained" onClick={() => removeItem(name)}>Remove</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
