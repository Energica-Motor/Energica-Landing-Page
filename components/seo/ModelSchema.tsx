interface Props {
  name: string;
  description: string;
  image: string;
  url: string;
  specs: { power: string; torque: string; topSpeed: string; range: string };
}

export default function ModelSchema({ name, description, image, url, specs }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": `Energica ${name}`,
    "brand": {
      "@type": "Brand",
      "name": "Energica Motor Company",
      "@id": "https://energicamotor.com/#organization"
    },
    "description": description,
    "image": `https://energicamotor.com${image}`,
    "url": `https://energicamotor.com${url}`,
    "category": "Electric Motorcycle",
    "manufacturer": {
      "@type": "Organization",
      "@id": "https://energicamotor.com/#organization"
    },
    "countryOfOrigin": "IT",
    "additionalProperty": [
      { "@type": "PropertyValue", "name": "Power", "value": specs.power },
      { "@type": "PropertyValue", "name": "Torque", "value": specs.torque },
      { "@type": "PropertyValue", "name": "Top Speed", "value": specs.topSpeed },
      { "@type": "PropertyValue", "name": "Range", "value": specs.range },
      { "@type": "PropertyValue", "name": "Drivetrain", "value": "Electric" },
      { "@type": "PropertyValue", "name": "Charging", "value": "CCS DC Fast Charge + AC Level 2" },
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
