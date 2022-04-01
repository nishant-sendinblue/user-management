import React, { useEffect, useMemo } from 'react'
import './dashboard.css'
import VisibilityTwoToneIcon from '@mui/icons-material/VisibilityTwoTone';
import ModeEditTwoToneIcon from '@mui/icons-material/ModeEditTwoTone';
import DeleteTwoToneIcon from '@mui/icons-material/DeleteTwoTone';
import { Link } from 'react-router-dom';
import FiberManualRecordTwoToneIcon from '@mui/icons-material/FiberManualRecordTwoTone';
import axios from 'axios';
import { API_URL } from '../../config';
import { useState } from 'react';
import Button from '@mui/material/Button';
import PersonAddAltTwoToneIcon from '@mui/icons-material/PersonAddAltTwoTone';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import { NotificationManager } from 'react-notifications';
import Pagination from '@mui/material/Pagination';
import FilterbyDate from '../filterbyDate/filterbyDate';
import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';
import debouce from "lodash.debounce";
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { DateRangePicker } from 'react-date-range';
import Modal from '@mui/material/Modal';
import { addDays } from 'date-fns';
import Box from '@mui/material/Box';

const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 600,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
};
function Dashboard({ token }) {

    const [oepnDialog, setOpenDialog] = useState(false)
    const [users, setUsers] = useState([]);
    // const [allUsers, setAllUsers] = useState([]);
    const [searchByid, setSearchByid] = useState("");
    const [datafor, setDatafor] = useState("");
    let listToDisplay = users;
    const [page, setPages] = useState(0);
    const [currentPage, setcurrentPage] = useState(1);
    const indexOfLastPost = currentPage * 6;
    const indexofFirstPost = indexOfLastPost - 6;
    const [userId, setUserId] = useState()
    useEffect(() => {
        getData(currentPage);
    }, [])
    const handleDeleteUser = (id) => {
        setOpenDialog(true);
        setUserId(id);
    }
    const handleClose = () => {
        setOpenDialog(false);
    };
    const handleDisagree = () => {
        setOpenDialog(false);
    }
    const handleAgree = async () => {
        try {
            let res = await axios.delete(`${API_URL}/users/${userId}`, {
                headers: {
                    authorization: token
                }
            })
            if (res.status === 200) {
                getData(currentPage);
                setOpenDialog(false);
                NotificationManager.success(" User Deleted Successfully.", "Success", 5000)
            }
        }
        catch (error) {
            NotificationManager.error(" Some Error Occured!", "Error", 5000)
            throw Error(error);
        }
    }
    const handleChangePage = (event, value) => {
        setcurrentPage(value);
        if (datafor == "filteredUsers") {
            handleFilterApply(value)
        } else {
            getData(value);
        }
    };
    const getData = async (curPage) => {
        try {
            let res = await axios.get(`${API_URL}/users?page=${curPage}&limit=6`, {
                headers: {
                    authorization: token
                }
            })
            if (res.data) {
                setUsers(res.data.results);
                setDatafor("allusers")
                setPages(Math.ceil(res.data?.count / 6));
            }
        }
        catch (error) {
            NotificationManager.error(" Some Error Occured!", "Error", 5000)
            throw Error(error);
        }
    }
    // for searching user
    const handleSearch = async (e) => {
        try {
            if (e.target.value != "") {
                let res = await axios.get(`${API_URL}/users/search?name=${e.target.value}`, {
                    headers: {
                        authorization: token
                    }
                })
                if (res?.data) {
                    setUsers(res?.data);
                    setPages(0);
                }
            } else {
                getData();
            }
        } catch (error) {
            console.log(error);
        }
    }
    const debouncedResults = useMemo(() => {
        return debouce(handleSearch, 300);
    }, []);

    const handleUserSearchById = async () => {
        try {
            let res = await axios.get(`${API_URL}/users/${searchByid}`, {
                headers: {
                    authorization: token
                }
            })
            if (res?.data) {
                setUsers([res?.data]);
                setPages(0);
            }
        } catch (error) {
            console.log(error);
        }
    }

    const handleSearchByIdChange = (e) => {
        setSearchByid(e.target.value);
        if (e.target.value === "") {
            getData();
        }
    }
    const [openPicker, setOpenPicker] = useState(false)
    const [state, setState] = useState([
        {
            startDate: new Date(),
            endDate: addDays(new Date(), 7),
            key: 'selection'
        }
    ]);
    const handleOpenDate = () => {
        setOpenPicker(!openPicker)
    }
    const handleFilterApply = async (value) => {
        let res = await axios.get(`${API_URL}/users/search?startDate=${state[0]?.startDate}&endDate=${state[0]?.endDate}&page=${value}&limit=6`, {
            headers: {
                authorization: token
            }
        })
        if (res?.data) {
            setUsers(res?.data?.results);
            setPages(Math.ceil(res.data?.count / 6));
            setDatafor("filteredUsers");
        } else {
            NotificationManager.info("No User Were Created or Found!", "Info", 5000)
        }
        setOpenPicker(false);
    }
    const handleCloseDatePicker = () => {
        setOpenPicker(false)
    }
    const handleDateChange = (item) => {
        setState([item.selection])
    }

    return (
        <div className='dashContainer'>
            <Dialog
                open={oepnDialog}
                onClose={handleClose}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                    {"Are you sure?"}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        On agree, user will be deleted permanently!
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleDisagree}>Disagree</Button>
                    <Button onClick={handleAgree} autoFocus>
                        Agree
                    </Button>
                </DialogActions>
            </Dialog>

            <div className='innerDashContent'>
                <div className='aboveTable'>
                    <div className='child1'>
                        <h3 style={{
                            color: "#1976d2", textTransform: "uppercase"
                        }}>Users</h3>
                        <div className='searchById'>
                            <input onChange={handleSearchByIdChange} type="search" placeholder="Search by _id...">
                            </input>
                            <PersonSearchIcon onClick={handleUserSearchById} fontSize="medium" style={{ color: "#1976d2", cursor: "pointer", marginLeft: "-30px" }} />
                        </div>
                    </div>
                    <div className='child2'>
                        {/* for searching user */}
                        <div className='searchContainer'>
                            <div className='inputDiv' >
                                <div className='iconWrapper'>
                                    <SearchIcon
                                    />
                                </div>
                                <InputBase
                                    className='inputBase'
                                    placeholder="Search…"
                                    onChange={debouncedResults}
                                    inputProps={{ 'aria-label': 'search' }}
                                />
                            </div>
                        </div>
                        {/* for searching user end */}
                        <div>
                            <Modal
                                open={openPicker}
                                onClose={handleCloseDatePicker}
                            >
                                <Box sx={style}>
                                    <DateRangePicker
                                        onChange={handleDateChange}
                                        months={1}
                                        ranges={state}
                                        showPreview={true}
                                    />
                                    <span style={{ width: "0", margin: "0 auto", display: "block" }}>
                                        <Button onClick={() => handleFilterApply(1)} variant="contained">
                                            Apply
                                        </Button>
                                    </span>
                                </Box>
                            </Modal>
                            <span>
                                <Button onClick={handleOpenDate} variant="outlined" startIcon={<FilterAltIcon />}>
                                    Filter users By date
                                </Button>
                            </span>
                        </div>
                        < Link to={"/add_new_user"} >
                            <Button variant="outlined" startIcon={<PersonAddAltTwoToneIcon />}>
                                Add User
                            </Button>
                        </Link>
                    </div>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Sr. No.</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Role</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            listToDisplay.length > 0 ?
                                listToDisplay.map((item, index) => (
                                    <tr key={item._id}>
                                        <td>{indexofFirstPost + index + 1}</td>
                                        <td>{item.name}</td>
                                        <td>{item.email}</td>
                                        {item.status === "active" ?
                                            <td id='active'><FiberManualRecordTwoToneIcon color='success' fontSize="10" />Active </td>
                                            :
                                            <td id='active'><FiberManualRecordTwoToneIcon color='error' fontSize="10" />InActive </td>
                                        }
                                        <td id='role'>{item.role}</td>
                                        <td>
                                            <Link id={item.role === "admin" ? "action" : ""} to={`/view_user/${item._id}`} >
                                                <VisibilityTwoToneIcon color='primary' />
                                            </Link>
                                            {
                                                item.role === "user" &&
                                                <>
                                                    <Link to={`/edit_user/${item._id}`}>
                                                        <ModeEditTwoToneIcon color='success' />
                                                    </Link>
                                                    <span onClick={() => handleDeleteUser(item._id)}>
                                                        <DeleteTwoToneIcon color='error' />
                                                    </span>
                                                </>
                                            }
                                        </td>
                                    </tr>
                                ))
                                :
                                <tr>
                                    <td>No Data to Show!</td>
                                </tr>
                        }


                    </tbody>
                </table>
                {
                    page > 1 &&
                    <div className="pagination">
                        <Pagination count={page} variant="text" page={currentPage} onChange={handleChangePage} color="primary" />
                    </div>
                }
            </div>
        </div >
    )
}

export default Dashboard