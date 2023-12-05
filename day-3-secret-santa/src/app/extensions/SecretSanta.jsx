import React, { useState } from "react";
import {
  Divider,
  Button,
  Text,
  Heading,
  List,
  Link,
  Input,
  Flex,
  Tile,
  hubspot,
} from "@hubspot/ui-extensions";

hubspot.extend(() => <SecretSanta />);

const SecretSanta = () => {
  const [person, setPerson] = useState("");
  const [password, setPassword] = useState("");
  const [people, setPeople] = useState([]);
  const [pairings, setPairings] = useState([]);
  const [pairingPasswords, setPairingPasswords] = useState({});
  const [error, setError] = useState(null);

  const addPerson = () => {
    if (person && password) {
      setPeople([...people, { person, password }]);
      setPerson("");
      setPassword("");
    }
  };

  const removePerson = (i) => {
    const firstArr = people.slice(0, i);
    const secondArr = people.slice(i + 1);
    setPeople([...firstArr, ...secondArr]);
  };

  const resetPairings = () => {
    setPairings([]);
    setPeople([]);
    setPerson("");
    setPassword("");
  };

  const generatePairings = () => {
    if (error) {
      setError(null);
    }

    const numPeople = people.length;
    let newPairings = [];

    const attemptToPair = () => {
      newPairings = people.map(({ person, password }) => ({
        person,
        password,
        buyingFor: null,
      }));

      for (let i = 0; i < newPairings.length; i++) {
        let successfullyChoseAPersonToBuyFor = false;
        let tries = 0;

        while (!successfullyChoseAPersonToBuyFor && tries < 50) {
          const randomIndex = Math.floor(Math.random() * numPeople);
          const isOtherPerson = randomIndex !== i;
          const personIsNotBeingBoughtForYet = !newPairings.some(
            (pairing) => pairing.buyingFor === people[randomIndex].person
          );
          const personisNotReciprocating =
            newPairings[randomIndex].buyingFor !== people[i].person;

          if (
            isOtherPerson &&
            personIsNotBeingBoughtForYet &&
            personisNotReciprocating
          ) {
            newPairings[i] = {
              ...newPairings[i],
              buyingFor: people[randomIndex].person,
            };
            successfullyChoseAPersonToBuyFor = true;
          }
          tries++;
        }
      }
    };

    let successfullyPaired = false;
    let tries = 0;

    while (!successfullyPaired && tries <= 10) {
      attemptToPair();
      if (newPairings.every((pairing) => !!pairing.buyingFor)) {
        successfullyPaired = true;
      } else {
        tries++;
      }
    }

    if (successfullyPaired) {
      setPairings(newPairings);
      setPeople([]);
      setPerson("");
      setPassword("");
    } else {
      setError("Failed to generate pairings");
    }
  };

  const renderInputs = () => {
    if (pairings.length) {
      return null;
    }
    return (
      <Flex direction="row" align="end" gap="small">
        <Input
          name="person"
          label="Name"
          value={person}
          onInput={(p) => setPerson(p)}
        />
        <Input
          name="password"
          label="Password"
          type="password"
          value={password}
          onInput={(p) => setPassword(p)}
        />
        <Button
          type="submit"
          disabled={!person || !password}
          onClick={addPerson}
        >
          Add
        </Button>
      </Flex>
    );
  };

  const renderPeople = () => {
    if (pairings.length) {
      return null;
    }
    if (!people.length) {
      return <Heading>No participants</Heading>;
    }
    return (
      <>
        <Heading>Participants</Heading>
        <List variant="inline">
          {people.map(({ person }, i) => {
            return (
              <Text key={`${person}-${i}`}>
                {person} <Link onClick={() => removePerson(i)}>(x)</Link>
              </Text>
            );
          })}
        </List>
      </>
    );
  };

  const renderButtons = () => {
    if (pairings.length) {
      return (
        <Button type="submit" variant="destructive" onClick={resetPairings}>
          Reset
        </Button>
      );
    }
    return (
      <Button
        type="submit"
        variant="primary"
        onClick={generatePairings}
        disabled={people.length <= 2}
      >
        Generate pairings{people.length <= 2 ? " (min 3 people required)" : ""}
      </Button>
    );
  };

  const renderPairingSecret = (pairing) => {
    if (pairingPasswords[pairing.person] !== pairing.password) {
      return null;
    }
    return (
      <>
        <Divider distance="extra-small" />
        <Flex align="center" gap="extra-small">
          <Text>You are buying for: </Text>
          <Text format={{ fontWeight: "bold" }}>{pairing.buyingFor}</Text>
          <Link
            onClick={() =>
              setPairingPasswords({
                ...pairingPasswords,
                [pairing.person]: "",
              })
            }
          >
            (hide)
          </Link>
        </Flex>
      </>
    );
  };

  const renderPairing = (pairing, i) => {
    return (
      <Tile key={`${pairing.person}-${i}`}>
        <Flex align="center" justify="between" gap="extra-small">
          <Heading>{pairing.person}</Heading>
          <Input
            name="pairing-password"
            label="Enter your password to view your pairing"
            type="password"
            value={pairingPasswords[pairing.person]}
            onInput={(p) =>
              setPairingPasswords({ ...pairingPasswords, [pairing.person]: p })
            }
          />
        </Flex>
        {renderPairingSecret(pairing)}
      </Tile>
    );
  };

  const renderPairings = () => {
    if (error) {
      return <Heading>{error}</Heading>;
    }
    if (!pairings.length) {
      return null;
    }
    return (
      <>
        <Heading>Secret Santa Pairings</Heading>
        <Text>Use your password to see who you are buying for!</Text>
        <Flex direction="column" gap="small">
          {pairings.map(renderPairing)}
        </Flex>
      </>
    );
  };

  return (
    <Flex direction="column" gap="medium">
      <Text>
        Ho! Ho! Ho! Use this tool to generate random Secret Santa pairings. Each
        participant must enter their name and a password. The password will be
        used to secretly view the name of the person that you are assigned to.
      </Text>

      <Divider />
      {renderInputs()}
      {renderPeople()}
      {renderButtons()}
      {renderPairings()}
    </Flex>
  );
};
