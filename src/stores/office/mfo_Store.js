import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { ref } from 'vue';

export const useMfoStore = defineStore('mfoStore', () => {
  // State
  const mfos = ref([]);
  const outputs = ref([]);
  const categories = ref([]);
  const loading = ref(false);

  // Actions
  async function fetchData(officeId) {
    loading.value = true;
    try {
      // Fetch categories first
      const categoriesResponse = await api.get('/fetch_f_category');
      categories.value = categoriesResponse.data;

      // Fetch MFOs
      const mfosResponse = await api.get('/allMfos', {
        params: { office_id: officeId }
      });

      mfos.value = mfosResponse.data.map(mfo => ({
        ...mfo,
        category: categories.value.find(c => c.id === mfo.f_category_id)
      }));

      // Fetch outputs
      const outputsResponse = await api.get('/allOutputs', {
        params: { office_id: officeId }
      });

      outputs.value = outputsResponse.data.map(output => ({
        ...output,
        category: categories.value.find(c => c.id === output.f_category_id),
        mfo: mfos.value.find(m => m.id === output.mfo_id)
      }));
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    } finally {
      loading.value = false;
    }
  }

  async function addMfos(officeId, mfoNames, categoryId) {
    try {
      const promises = mfoNames.map(name => {
        return api.post('/add_mfo', {
          office_id: officeId,
          name: name,
          f_category_id: categoryId
        });
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error adding MFOs:', error);
      throw error;
    }
  }

  async function updateMfo(mfoId, officeId, name, categoryId) {
    try {
      await api.post(`/mfos/${mfoId}`, {
        office_id: officeId,
        name: name,
        f_category_id: categoryId
      });
    } catch (error) {
      console.error('Error updating MFO:', error);
      throw error;
    }
  }

  async function deleteMfo(mfoId) {
    try {
      await api.delete(`/mfos/${mfoId}`);
    } catch (error) {
      console.error('Error deleting MFO:', error);
      throw error;
    }
  }

  async function addOutputs(outputsData) {
    try {
      const promises = outputsData.map(output => {
        return api.post('/add_output', output);
      });

      await Promise.all(promises);
    } catch (error) {
      console.error('Error adding outputs:', error);
      throw error;
    }
  }

  async function updateOutput(outputId, outputData) {
    try {
      await api.post(`/outputs/${outputId}`, outputData);
    } catch (error) {
      console.error('Error updating output:', error);
      throw error;
    }
  }

  async function deleteOutput(outputId) {
    try {
      await api.delete(`/outputs/${outputId}`);
    } catch (error) {
      console.error('Error deleting output:', error);
      throw error;
    }
  }

  return {
    // State
    mfos,
    outputs,
    categories,
    loading,

    // Actions
    fetchData,
    addMfos,
    updateMfo,
    deleteMfo,
    addOutputs,
    updateOutput,
    deleteOutput
  };
});
