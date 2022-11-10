import React from "react";
import cytoscape from "cytoscape";
import CytoscapeComponent from "react-cytoscapejs";
import { get, mapKeys, camelCase, chain, merge, size } from 'lodash';
import viewUtilities from "cytoscape-view-utilities";

import { entity } from './dummy';
import { secondHop } from "./smallerData";

// camelCase and or rename keys
export const schemafyKeys = (arr, type) => (arr || []).map(obj => ({
  ...mapKeys(obj, (_, key) => camelCase(key)),
  ...get({
    locations: { name: get(obj, 'country') },
    people: { role: get(obj, 'relationship'), dateOfBirth: get(obj, 'dob') },
  }, type, {}),
}));

const renderIcon = type => type === 'person'
  ? "https://as2.ftcdn.net/v2/jpg/01/18/03/33/1000_F_118033377_JKQA3UFE4joJ1k67dNoSmmoG4EsQf9Ho.jpg"
  : type === 'company'
  ? "https://as2.ftcdn.net/v2/jpg/00/72/97/89/1000_F_72978994_Djp0dstP6T6K4hOrRzPELKClDAHKxPz1.jpg"
  : type === 'owner'
  ? "https://as1.ftcdn.net/v2/jpg/04/37/01/34/1000_F_437013476_uKlcuNHFZSk8LB1ijBmp5BCUPpCJ3iMo.jpg"
  : "https://as2.ftcdn.net/v2/jpg/01/59/03/43/1000_F_159034305_V8nNQSkCeBCsm69DbM915m61e59f4muQ.jpg";

const constructNode = (id, type, name) => ({ 
  data: { 
    id,  
    icon: renderIcon(type),
    label: name, 
    type 
  } });

  const constructEdge = (label, source, target) => ({ 
    data: { 
      label,  
      source,
      target
    } });

viewUtilities(cytoscape);

const SecondGraph = () => {
  const {  name, riskData: { results: entityResults } = {} } = entity.data || {};

  const results = entityResults || [];

  const associations = chain(results).map(r => r.associations).flatten().value();

  const mergedAssociations = associations.reduce((prev, curr) => merge(prev, curr), {});

  const { companies = [], direct_owners: directOwners = [], people = []  } = mergedAssociations;

  const peopleData = schemafyKeys(people);
  const companiesData = schemafyKeys(companies);
  const directOwnersData = schemafyKeys(directOwners);

  const secondPeopleData = schemafyKeys(secondHop.people);
  const secondCompaniesData = schemafyKeys(secondHop.companies);
  const secondDirectOwnersData = schemafyKeys(secondHop['direct-owners']);

  const peopleNodes = size(peopleData) ? peopleData.slice(0, 3).map(({ name, type }, i) => constructNode(`person-${i}`, type, name )) : [];
  const companyNodes = size(companiesData) ? companiesData.slice(0, 3).map(({ name, type }, i) => constructNode(`company-${i}`, type, name)) : [];
  const directOwnerNodes = size(directOwners) ? directOwnersData.slice(0, 3).map(({ name, type }, i) => constructNode(`direct-owner-${i}`, type, name)) : [];


  const secondPeopleNodes = secondPeopleData.map(({ name, type }, i) => constructNode(`person-2-${i}`, type, name ));
  const secondCompanyNodes = secondCompaniesData.map(({ name, type }, i) => constructNode(`company-2-${i}`, type, name));
  const secondDirectOwnerNodes = secondDirectOwnersData.map(({ name, type }, i) => constructNode(`direct-owner-2-${i}`, 'direct-owner', name));

  const edgesArray = size(peopleData) ? peopleData.slice(0, 3).map(({ name, relationship }, i) => constructEdge(relationship, 1, `person-${i}`)) : [];
  const companyEdgesArray = size(companiesData) ? companiesData.slice(0, 3).map(({ name, relationship }, i) => constructEdge(relationship, 1, `company-${i}`)) : [];
  const directOwnersEdgesArray = size(directOwners) ? directOwnersData.slice(0, 3).map(({ name, relationship }, i) => constructEdge(relationship, 1, `direct-owner-${i}`)) : [];

  const secondPeopleEdges = secondPeopleData.map(({ name, type, relationship }, i) => constructEdge(relationship,`person-0`, `person-2-${i}`, ));
  const secondCompanyEdges = secondCompaniesData.map(({ name, type, relationship }, i) => constructEdge(relationship, `company-0`, `company-2-${i}`));
  const secondDirectOwnerEdges = secondDirectOwnersData.map(({ name, type, relationship }, i) => constructEdge(relationship, `direct-owner-0`, `direct-owner-2-${i}`));

  const elements = [
    { data: { id: 1, label: name, title: name, icon: "https://as2.ftcdn.net/v2/jpg/01/59/03/43/1000_F_159034305_V8nNQSkCeBCsm69DbM915m61e59f4muQ.jpg" } },
    ...peopleNodes,
    ...companyNodes,
    ...directOwnerNodes,
    ...edgesArray,
    ...companyEdgesArray,
    ...directOwnersEdgesArray,
    ...secondCompanyNodes,
    // ...secondCompanyEdges,
    ...secondDirectOwnerEdges,
    ...secondDirectOwnerNodes,
    ...secondPeopleNodes,
    // ...secondPeopleEdges,
    constructEdge('linkedTo', `person-1`, `person-2-1`),
    constructEdge('linkedTo', `person-1`, `person-2-2`),
    constructEdge('linkedTo', `company-0`, `company-2-0`),
    constructEdge('linkedTo', `company-0`, `company-2-2`),
    constructEdge('Related',`person-0`, `person-2-0`),
    constructEdge('linkedTo', `company-1`, `company-2-1`),
  ];

  console.log(elements, 'elem---');
  const stylesheet = [
    {
      selector: "node",
      css: {
        label: "data(label)",
        "background-image": "data(icon)",
        color: '#fff',
        'font-size': '16px',
        height: 80,
        width: 80,
        "background-fit": "cover"
      },
    },
    {
      selector: 'node',
      style: {
        'text-wrap': 'wrap',
        "text-max-width": 50
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier'
      }
    },
    {
      selector: 'edge',
      style: {
        'label': 'data(label)', // maps to data.label
        'color': '#fff'
      }
    } 
  ];

  const layout = {
    name: "breadthfirst",
    directed: true
  };

  return (
    <CytoscapeComponent
      cy={(cy) => {
        const instance = cy.viewUtilities();
        instance.hide(
          cy
            .elements()
            .difference(cy.nodes("node#1").closedNeighborhood())
        );
        cy.on("tap", "node", (event) => {
          console.log(event)
          instance.show(event.target.neighborhood());
        });
      }}
      stylesheet={stylesheet}
      elements={elements}
      style={{ width: 600, height: 600 }}
      layout={layout}
    />
  );
};

export default SecondGraph;
