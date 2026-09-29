import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ucmsgrkegdfelipfzcfu.supabase.co'; // استبدله برابط مشروعك
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVjbXNncmtlZ2RmZWxpcGZ6Y2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2ODgyOTQsImV4cCI6MjEwNjI2NDI5NH0.7ZpEstj_Wb6c_7LnCyjJB3-NCOymRQSI8R_nlQjOJBA'; // استبدله بالمفتاح الخاص بك

export const supabase = createClient(supabaseUrl, supabaseAnonKey);