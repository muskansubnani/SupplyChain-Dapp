
import ItemManager from "./contracts/ItemManager.json";
import Item from "./contracts/Item.json";
import Web3 from 'web3';
import "./App.css";
import React, { Component } from "react";

class App extends Component {
  state = {cost: 0, itemName: "exampleItem1", loaded:false};
  componentDidMount = async () => {
    try {
    // Get network provider and web3 instance.
    console.log(Web3.givenProvider );

    const web3 = new Web3(Web3.givenProvider || "ws://localhost:9545");
    // Use web3 to get the user's accounts.
    this.accounts = await web3.eth.requestAccounts();  //try this later
    console.log( this.accounts);

    // Get the contract instance.
    this.networkId = await web3.eth.net.getId();

    //console.log(ItemManager.networks[this.networkId].address);

    console.log(this.networkId);
    this.itemManager = new web3.eth.Contract(
    ItemManager.abi,
    ItemManager.networks[this.networkId] && ItemManager.networks[this.networkId].address,
    );
    this.item = new web3.eth.Contract(
    Item.abi,
    Item.networks[this.networkId] && Item.networks[this.networkId].address,
    );

    // Set web3, accounts, and contract to the state, and then proceed with an
    // example of interacting with the contract's methods.
    this.listenToPaymentEvent();

    this.setState({loaded:true});

    } catch (error) {
    // Catch any errors for any of the above operations.
    alert(
    `Failed to load web3, accounts, or contract. Check console for details.`,
    );
    console.error(error);
    }
  };

  handleSubmit = async () => {
    const { cost, itemName } = this.state;
    console.log(itemName, cost, this.itemManager, this.item, this.accounts, this.networkId);
    let result = await this.itemManager.methods.createItem(itemName, cost).send({ from:
    this.accounts[0] });
    console.log(result);
    alert("Send "+cost+" Wei to "+result.events.SupplyChainStep.returnValues._address);
  };

  handleInputChange = (event) => {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState({
    [name]: value
    })
  };

  listenToPaymentEvent = () => {
      let self = this;
      this.itemManager.events.SupplyChainStep().on("data", async function(evt) {
      if(evt.returnValues._step === 1) {
      let item = await self.itemManager.methods.items(evt.returnValues._itemIndex).call(
      );
      console.log(item);
      alert("Item " + item._identifier + " was paid, deliver it now!");
      };
      console.log(evt);
      });
    }

  render() {
    if (!this.state.loaded) {
    return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
    <div className="App">
    <h1>Simply Payment/Supply Chain Example!</h1>
    <h2>Items</h2>
    <h2>Add Element</h2>
    Cost: <input type="text" name="cost" value={this.state.cost} onChange={this.handleInputChange} />
    Item Name: <input type="text" name="itemName" value={this.state.itemName} onChange
    ={this.handleInputChange} />
    <button type="button" onClick={this.handleSubmit}>Create new Item</button>
    </div>
    );
  }

};

export default App;
