import React, { useState, useEffect } from "react";

import { makeStyles } from '@material-ui/core/styles';
import Title from './Title';

import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import socketIOClient from "socket.io-client";
import axios from 'axios';

const ENDPOINT = "http://127.0.0.1:8080";
const listnerEvents = {
  NEW_ORDER: "NEW_ORDER"
};

async function getOrders() {
  const res = await axios('http://localhost:8080/api/orders');
  return await res.data;
}

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
}));

export default function Orders() {
  const classes = useStyles();
  const [orders, setOrders] = useState([]);

  async function initData() {
    try {
      const ordersList = await getOrders();
      setOrders(ordersList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
    } catch (err) {
      console.log(err);
    }
  }

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT);
    initData();
    socket.on('connect', () => {
      console.log('Successfully connected!');
      socket.on(listnerEvents.NEW_ORDER, async status => {
        if (status) {
          try {
            const ordersList = await getOrders();
            setOrders(ordersList.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
          } catch (err) {
            console.log(err);
          }
        }
      });
    });

  }, []);
  return (
    <React.Fragment>
      <Title>Recent Orders</Title>
      <div className={classes.root}>
        {orders.map((order, i) => <Accordion key={i}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Typography className={classes.heading}><b>Name:</b> {order.user.fullName} | <b>Total:</b> {order.total} | <b>Status:</b> {order.status} | <b>Time:</b> {new Date(order.updatedAt).toLocaleString()}</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {order.items.map((item, i2) => <div key={i2}>
              <b>Name: </b> {item.product.type}
              <br />
              <b>Description: </b> {item.product.description}
              <br />
              <b>Price: </b> {item.product.price}
              <br />
              <b>Quantity: </b> {item.product.type}
              <br />
              <br />

              <b>Customer Name: </b> {order.user.fullName}
              <br />
              <b>Address: </b> {order.user.address.number + ", " + order.user.address.street + ", " + order.user.address.city + ", " + order.user.address.state + ", " + order.user.address.zipCode + ", " + order.user.address.country}
              <br />
              <br />

            </div>)}
          </AccordionDetails>
        </Accordion>)}
      </div>

    </React.Fragment>
  );
}
