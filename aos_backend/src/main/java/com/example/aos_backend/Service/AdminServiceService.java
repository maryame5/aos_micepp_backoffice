package com.example.aos_backend.Service;

import com.example.aos_backend.Repository.ServiceRepository;
import com.example.aos_backend.Repository.ServiceInfoRepository;
import com.example.aos_backend.dto.ServiceDTO;
import com.example.aos_backend.dto.CreateServiceRequest;
import com.example.aos_backend.dto.UpdateServiceRequest;
import com.example.aos_backend.dto.FormField;
import com.example.aos_backend.user.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminServiceService {

    @Autowired
    private ServiceRepository serviceRepository;

    @Autowired
    private ServiceInfoRepository serviceInfoRepository;

    public List<ServiceDTO> getAllServicesForAdmin() {
        return serviceRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ServiceDTO getServiceById(Long id) {
        Optional<ServiceEntity> service = serviceRepository.findById(id);
        return service.map(this::convertToDTO).orElse(null);
    }

    public ServiceDTO createService(CreateServiceRequest request) {
        // Créer d'abord ServiceInfo
        ServiceInfo serviceInfo = new ServiceInfo();
        serviceInfo.setIcon(request.getIcon());
        serviceInfo.setTitle(request.getTitle());
        serviceInfo.setDescription(request.getDescription());
        serviceInfo.setFeatures(request.getFeatures());
        serviceInfo = serviceInfoRepository.save(serviceInfo);

        // Créer le service basé sur le type
        ServiceEntity serviceEntity = createServiceByType(request.getType());
        serviceEntity.setNom(request.getNom());
        serviceEntity.setType(request.getType());
        serviceEntity.setServiceInfo(serviceInfo);
        serviceEntity.setIsActive(true);

        serviceEntity = serviceRepository.save(serviceEntity);
        return convertToDTO(serviceEntity);
    }

    public ServiceDTO updateService(Long id, UpdateServiceRequest request) {
        Optional<ServiceEntity> optionalService = serviceRepository.findById(id);
        if (optionalService.isPresent()) {
            ServiceEntity serviceEntity = optionalService.get();

            // Mettre à jour les informations de base
            serviceEntity.setNom(request.getNom());

            // Mettre à jour ServiceInfo
            ServiceInfo serviceInfo = serviceEntity.getServiceInfo();
            if (serviceInfo == null) {
                serviceInfo = new ServiceInfo();
                serviceEntity.setServiceInfo(serviceInfo);
            }
            serviceInfo.setIcon(request.getIcon());
            serviceInfo.setTitle(request.getTitle());
            serviceInfo.setDescription(request.getDescription());
            serviceInfo.setFeatures(request.getFeatures());

            serviceEntity = serviceRepository.save(serviceEntity);
            return convertToDTO(serviceEntity);
        }
        return null;
    }

    public boolean deleteService(Long id) {
        if (serviceRepository.existsById(id)) {
            serviceRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public ServiceDTO toggleServiceStatus(Long id) {
        Optional<ServiceEntity> optionalService = serviceRepository.findById(id);
        if (optionalService.isPresent()) {
            ServiceEntity serviceEntity = optionalService.get();
            serviceEntity.setIsActive(!serviceEntity.getIsActive());
            serviceEntity = serviceRepository.save(serviceEntity);
            return convertToDTO(serviceEntity);
        }
        return null;
    }

    public List<String> getAvailableServiceTypes() {
        return Arrays.asList(
                "TransportService",
                "SanteSocialeService",
                "LogementService",
                "ColonieVacanceService",
                "AppuiScolaireService",
                "ActiviteCulturelleSportiveService");
    }

    private ServiceEntity createServiceByType(String type) {
        switch (type) {
            case "TransportService":
                return new TransportService();
            case "SanteSocialeService":
                return new SanteSocialeService();
            case "LogementService":
                return new LogementService();
            case "ColonieVacanceService":
                return new ColonieVacanceService();
            case "AppuiScolaireService":
                return new AppuiScolaireService();
            case "ActiviteCulturelleSportiveService":
                return new ActiviteCulturelleSportiveService();
            default:
                throw new IllegalArgumentException("Type de service non supporté: " + type);
        }
    }

    private ServiceDTO convertToDTO(ServiceEntity serviceEntity) {
        return ServiceDTO.builder()
                .id(serviceEntity.getId())
                .nom(serviceEntity.getNom())
                .type(serviceEntity.getType())
                .icon(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getIcon() : "business")
                .title(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getTitle()
                        : serviceEntity.getNom())
                .description(
                        serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getDescription() : "")
                .features(serviceEntity.getServiceInfo() != null ? serviceEntity.getServiceInfo().getFeatures()
                        : Arrays.asList())
                .isActive(serviceEntity.getIsActive())
                .formFields(getFormFieldsForService(serviceEntity.getType()))
                .requiredDocuments(getRequiredDocumentsForService(serviceEntity.getType()))
                .build();
    }

    private List<FormField> getFormFieldsForService(String serviceType) {
        switch (serviceType) {
            case "TransportService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("trajet").type("text").label("Trajet")
                                .required(true).placeholder("Ex: Casa-Rabat").build(),
                        FormField.builder()
                                .id("2").name("pointDepart").type("text").label("Point de départ")
                                .required(true).build(),
                        FormField.builder()
                                .id("3").name("pointArrivee").type("text").label("Point d'arrivée")
                                .required(true).build(),
                        FormField.builder()
                                .id("4").name("frequence").type("select").label("Fréquence")
                                .required(true)
                                .options(Arrays.asList("Quotidien", "Hebdomadaire", "Mensuel", "Occasionnel")).build());
            case "SanteSocialeService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("typeSoin").type("select").label("Type de soin")
                                .required(true)
                                .options(Arrays.asList("Consultation", "Chirurgie", "Médicaments", "Examens")).build(),
                        FormField.builder()
                                .id("2").name("montant").type("number").label("Montant (DH)")
                                .required(true).build());
            case "LogementService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("typeLogement").type("select").label("Type de logement")
                                .required(true).options(Arrays.asList("Appartement", "Maison", "Studio")).build(),
                        FormField.builder()
                                .id("2").name("localisationSouhaitee").type("text").label("Localisation souhaitée")
                                .required(true).build(),
                        FormField.builder()
                                .id("3").name("montantParticipation").type("number")
                                .label("Montant de participation (DH)")
                                .required(true).build());
            case "ColonieVacanceService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("nombreEnfants").type("number").label("Nombre d'enfants")
                                .required(true).build(),
                        FormField.builder()
                                .id("2").name("lieuSouhaite").type("text").label("Lieu souhaité")
                                .required(true).build(),
                        FormField.builder()
                                .id("3").name("periode").type("text").label("Période")
                                .required(true).placeholder("Ex: Juillet 2024").build());
            case "AppuiScolaireService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("niveau").type("select").label("Niveau scolaire")
                                .required(true).options(Arrays.asList("Primaire", "Collège", "Lycée", "Supérieur"))
                                .build(),
                        FormField.builder()
                                .id("2").name("typeAide").type("select").label("Type d'aide")
                                .required(true)
                                .options(Arrays.asList("Cours particuliers", "Fournitures", "Frais de scolarité"))
                                .build(),
                        FormField.builder()
                                .id("3").name("montantDemande").type("number").label("Montant demandé (DH)")
                                .required(true).build());
            case "ActiviteCulturelleSportiveService":
                return Arrays.asList(
                        FormField.builder()
                                .id("1").name("typeActivite").type("select").label("Type d'activité")
                                .required(true).options(Arrays.asList("Sport", "Culture", "Loisir")).build(),
                        FormField.builder()
                                .id("2").name("nomActivite").type("text").label("Nom de l'activité")
                                .required(true).build(),
                        FormField.builder()
                                .id("3").name("dateActivite").type("date").label("Date de l'activité")
                                .required(true).build());
            default:
                return Arrays.asList();
        }
    }

    private List<String> getRequiredDocumentsForService(String serviceType) {
        switch (serviceType) {
            case "TransportService":
                return Arrays.asList("Justificatif de domicile", "Attestation de travail");
            case "SanteSocialeService":
                return Arrays.asList("Ordonnance médicale", "Facture originale", "Attestation de mutuelle");
            case "LogementService":
                return Arrays.asList("Justificatif de revenus", "Attestation de domicile", "Contrat de location");
            case "ColonieVacanceService":
                return Arrays.asList("Certificat de scolarité", "Justificatif de revenus");
            case "AppuiScolaireService":
                return Arrays.asList("Certificat de scolarité", "Justificatif de revenus", "Bulletins scolaires");
            case "ActiviteCulturelleSportiveService":
                return Arrays.asList("Certificat médical", "Justificatif de revenus");
            default:
                return Arrays.asList("Pièce d'identité", "Justificatif de revenus");
        }
    }
}