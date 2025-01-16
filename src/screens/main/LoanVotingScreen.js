// src/screens/main/LoanVotingScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoanVotingScreen = () => {
  const [projects, setProjects] = useState([]);
  const [hasVoted, setHasVoted] = useState({});

  // Cargar proyectos de ejemplo al inicio
  useEffect(() => {
    loadProjects();
    loadUserVotes();
  }, []);

  const loadProjects = async () => {
    try {
      const savedProjects = await AsyncStorage.getItem('projects');
      if (!savedProjects) {
        // Si no hay proyectos, crear algunos de ejemplo
        const defaultProjects = [
          {
            id: '1',
            name: 'Panadería El Buen Trigo',
            amount: 5000,
            votes: { yes: 15, no: 3 },
            description: 'Expansión de panadería local con nuevos hornos',
          },
          {
            id: '2',
            name: 'Taller de Bicicletas Las Ruedas',
            amount: 7500,
            votes: { yes: 22, no: 5 },
            description: 'Compra de herramientas especializadas',
          },
          {
            id: '3',
            name: 'Café Internet El Navigate',
            amount: 10000,
            votes: { yes: 18, no: 12 },
            description: 'Actualización de equipos de cómputo',
          },
        ];
        await AsyncStorage.setItem('projects', JSON.stringify(defaultProjects));
        setProjects(defaultProjects);
      } else {
        setProjects(JSON.parse(savedProjects));
      }
    } catch (error) {
      console.error('Error cargando proyectos:', error);
    }
  };

  const loadUserVotes = async () => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);
      const votes = await AsyncStorage.getItem(`votes_${user.id}`);
      if (votes) {
        setHasVoted(JSON.parse(votes));
      }
    } catch (error) {
      console.error('Error cargando votos:', error);
    }
  };

  const handleVote = async (projectId, voteType) => {
    try {
      const userData = await AsyncStorage.getItem('currentUser');
      const user = JSON.parse(userData);

      if (hasVoted[projectId]) {
        Alert.alert('Error', 'Ya has votado en este proyecto');
        return;
      }

      const updatedProjects = projects.map(project => {
        if (project.id === projectId) {
          const updatedVotes = { ...project.votes };
          if (voteType === 'yes') {
            updatedVotes.yes += 1;
          } else {
            updatedVotes.no += 1;
          }
          return { ...project, votes: updatedVotes };
        }
        return project;
      });

      // Actualizar proyectos
      await AsyncStorage.setItem('projects', JSON.stringify(updatedProjects));
      setProjects(updatedProjects);

      // Guardar voto del usuario
      const updatedVotes = { ...hasVoted, [projectId]: voteType };
      await AsyncStorage.setItem(`votes_${user.id}`, JSON.stringify(updatedVotes));
      setHasVoted(updatedVotes);

      Alert.alert('Éxito', 'Tu voto ha sido registrado');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar tu voto');
    }
  };

  const calculateApprovalRate = (yes, no) => {
    const total = yes + no;
    return total > 0 ? ((yes / total) * 100).toFixed(1) : '0.0';
  };

  return (
    <ScrollView style={styles.container}>
      {projects.map(project => (
        <View key={project.id} style={styles.projectCard}>
          <Text style={styles.projectName}>{project.name}</Text>
          <Text style={styles.projectDescription}>{project.description}</Text>
          <Text style={styles.amount}>
            Monto solicitado: ${project.amount.toLocaleString('es-MX')}
          </Text>
          
          <View style={styles.statsContainer}>
            <Text style={styles.approvalRate}>
              Aprobación: {calculateApprovalRate(project.votes.yes, project.votes.no)}%
            </Text>
            <Text style={styles.voteCount}>
              Votos: {project.votes.yes + project.votes.no}
            </Text>
          </View>

          {!hasVoted[project.id] && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, styles.yesButton]}
                onPress={() => handleVote(project.id, 'yes')}
              >
                <Text style={styles.buttonText}>Aprobar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, styles.noButton]}
                onPress={() => handleVote(project.id, 'no')}
              >
                <Text style={styles.buttonText}>Rechazar</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasVoted[project.id] && (
            <Text style={styles.votedText}>Ya has votado en este proyecto</Text>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  projectName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#001F3F',
    marginBottom: 5,
  },
  projectDescription: {
    color: '#666',
    marginBottom: 10,
  },
  amount: {
    fontSize: 16,
    color: '#001F3F',
    marginBottom: 10,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  approvalRate: {
    color: '#4A90E2',
    fontWeight: 'bold',
  },
  voteCount: {
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  yesButton: {
    backgroundColor: '#28a745',
  },
  noButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  votedText: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginTop: 10,
  },
});

export default LoanVotingScreen;