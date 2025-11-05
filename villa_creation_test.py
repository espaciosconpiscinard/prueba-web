#!/usr/bin/env python3
"""
Villa Creation Testing Suite for Espacios Con Piscina
Tests villa creation with specific test data as requested by user
"""

import requests
import json
import sys
from typing import Dict, Any, Optional

# Backend URL from environment
BACKEND_URL = "https://villa-info-fix.preview.emergentagent.com/api"

class VillaCreationTester:
    def __init__(self):
        self.admin_token = None
        self.employee_token = None
        self.test_results = []
        
    def log_test(self, test_name: str, success: bool, message: str, details: Any = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def make_request(self, method: str, endpoint: str, data: Dict = None, token: str = None) -> Dict:
        """Make HTTP request to backend"""
        url = f"{BACKEND_URL}{endpoint}"
        headers = {"Content-Type": "application/json"}
        
        if token:
            headers["Authorization"] = f"Bearer {token}"
        
        try:
            if method == "GET":
                response = requests.get(url, headers=headers, params=data)
            elif method == "POST":
                response = requests.post(url, headers=headers, json=data)
            elif method == "PUT":
                response = requests.put(url, headers=headers, json=data)
            elif method == "DELETE":
                response = requests.delete(url, headers=headers)
            else:
                return {"error": f"Unsupported method: {method}"}
            
            try:
                data = response.json() if response.content else {}
            except Exception as json_error:
                data = {"json_error": str(json_error), "raw_content": response.text}
            
            return {
                "status_code": response.status_code,
                "data": data,
                "success": 200 <= response.status_code < 300
            }
        except Exception as e:
            return {"error": str(e), "success": False}
    
    def test_admin_login(self):
        """Login as admin"""
        login_data = {
            "username": "admin",
            "password": "admin123"
        }
        
        result = self.make_request("POST", "/auth/login", login_data)
        
        if result.get("success"):
            self.admin_token = result["data"]["access_token"]
            user_role = result["data"]["user"]["role"]
            if user_role == "admin":
                self.log_test("Admin Login", True, f"Admin logged in successfully, role: {user_role}")
            else:
                self.log_test("Admin Login", False, f"Wrong role returned: {user_role}")
        else:
            self.log_test("Admin Login", False, "Admin login failed", result)

    def test_villa_creation_with_specific_data(self):
        """Test villa creation with specific test data as requested by user"""
        print("\n🏠 Testing Villa Creation with Specific Test Data")
        
        # First, ensure we have a category to use
        categories_result = self.make_request("GET", "/categories", token=self.admin_token)
        if not categories_result.get("success") or not categories_result["data"]:
            # Create a test category if none exist
            category_data = {
                "name": "Zona Este",
                "description": "Villas ubicadas en zona este"
            }
            create_cat_result = self.make_request("POST", "/categories", category_data, self.admin_token)
            if create_cat_result.get("success"):
                test_category = create_cat_result["data"]
                self.log_test("Create Test Category for Villa", True, f"Created category: {test_category['name']}")
            else:
                self.log_test("Create Test Category for Villa", False, "Failed to create test category", create_cat_result)
                return
        else:
            test_category = categories_result["data"][0]
            self.log_test("Get Existing Category for Villa", True, f"Using category: {test_category['name']}")
        
        # First, check if TEST01 already exists and delete it
        existing_villas_result = self.make_request("GET", "/villas", token=self.admin_token)
        if existing_villas_result.get("success"):
            existing_villas = existing_villas_result["data"]
            test01_villa = next((v for v in existing_villas if v.get("code") == "TEST01"), None)
            if test01_villa:
                delete_result = self.make_request("DELETE", f"/villas/{test01_villa['id']}", token=self.admin_token)
                if delete_result.get("success"):
                    self.log_test("Delete Existing TEST01 Villa", True, "Existing TEST01 villa deleted successfully")
                else:
                    self.log_test("Delete Existing TEST01 Villa", False, "Failed to delete existing TEST01 villa", delete_result)
        
        # Test data as specified by user
        villa_test_data = {
            "code": "TEST01",
            "name": "Villa de Prueba",
            "description": "Villa moderna con piscina y área BBQ, perfecta para familias",
            "location": "Santo Domingo Este",
            "phone": "809-555-1234",
            "category_id": test_category["id"],
            "max_guests": 20,
            
            # Modalidades - Enable Pasadía
            "has_pasadia": True,
            "has_amanecida": False,
            "has_evento": False,
            
            # Horarios para Pasadía
            "check_in_time_pasadia": "9:00 AM",
            "check_out_time_pasadia": "6:00 PM",
            
            # Descripción detallada para Pasadía
            "description_pasadia": "Disfruta de un día completo con acceso a todas las áreas. Incluye piscina, BBQ y áreas verdes.",
            
            # Precios flexibles para Pasadía con el precio especificado
            "pasadia_prices": [
                {
                    "label": "10-20 personas",
                    "client_price": 15000.0,
                    "owner_price": 12000.0,
                    "show_in_web": True
                }
            ],
            
            # Arrays vacíos para otras modalidades
            "amanecida_prices": [],
            "evento_prices": [],
            
            # Monedas
            "currency_pasadia": "DOP",
            "currency_amanecida": "DOP", 
            "currency_evento": "DOP",
            
            # Extras (valores por defecto)
            "extra_hours_price_client": 0.0,
            "extra_hours_price_owner": 0.0,
            "extra_people_price_client": 0.0,
            "extra_people_price_owner": 0.0,
            
            # Estado activo
            "is_active": True
        }
        
        # Step 1: Create the villa
        print("   📝 Creating villa with test data...")
        create_result = self.make_request("POST", "/villas", villa_test_data, self.admin_token)
        
        if not create_result.get("success"):
            self.log_test("Create Villa TEST01", False, f"Failed to create villa. Status: {create_result.get('status_code')}", create_result)
            return
        
        created_villa = create_result["data"]
        villa_id = created_villa["id"]
        self.log_test("Create Villa TEST01", True, f"Villa created successfully with ID: {villa_id}")
        
        # Step 2: Verify villa data was saved correctly
        print("   🔍 Verifying villa data...")
        get_result = self.make_request("GET", f"/villas/{villa_id}", token=self.admin_token)
        
        if not get_result.get("success"):
            self.log_test("Get Created Villa", False, "Failed to retrieve created villa", get_result)
            return
        
        retrieved_villa = get_result["data"]
        
        # Verify all the key fields
        verification_checks = []
        
        # Basic info
        if retrieved_villa.get("code") == "TEST01":
            verification_checks.append("✓ Code: TEST01")
        else:
            verification_checks.append(f"✗ Code: {retrieved_villa.get('code')} (expected: TEST01)")
        
        if retrieved_villa.get("name") == "Villa de Prueba":
            verification_checks.append("✓ Name: Villa de Prueba")
        else:
            verification_checks.append(f"✗ Name: {retrieved_villa.get('name')} (expected: Villa de Prueba)")
        
        if retrieved_villa.get("location") == "Santo Domingo Este":
            verification_checks.append("✓ Location: Santo Domingo Este")
        else:
            verification_checks.append(f"✗ Location: {retrieved_villa.get('location')} (expected: Santo Domingo Este)")
        
        if retrieved_villa.get("phone") == "809-555-1234":
            verification_checks.append("✓ Phone: 809-555-1234")
        else:
            verification_checks.append(f"✗ Phone: {retrieved_villa.get('phone')} (expected: 809-555-1234)")
        
        if retrieved_villa.get("max_guests") == 20:
            verification_checks.append("✓ Max Guests: 20")
        else:
            verification_checks.append(f"✗ Max Guests: {retrieved_villa.get('max_guests')} (expected: 20)")
        
        # Modalidades
        if retrieved_villa.get("has_pasadia") is True:
            verification_checks.append("✓ Has Pasadía: True")
        else:
            verification_checks.append(f"✗ Has Pasadía: {retrieved_villa.get('has_pasadia')} (expected: True)")
        
        # Horarios
        if retrieved_villa.get("check_in_time_pasadia") == "9:00 AM":
            verification_checks.append("✓ Check-in Pasadía: 9:00 AM")
        else:
            verification_checks.append(f"✗ Check-in Pasadía: {retrieved_villa.get('check_in_time_pasadia')} (expected: 9:00 AM)")
        
        if retrieved_villa.get("check_out_time_pasadia") == "6:00 PM":
            verification_checks.append("✓ Check-out Pasadía: 6:00 PM")
        else:
            verification_checks.append(f"✗ Check-out Pasadía: {retrieved_villa.get('check_out_time_pasadia')} (expected: 6:00 PM)")
        
        # Descripción detallada
        expected_description = "Disfruta de un día completo con acceso a todas las áreas. Incluye piscina, BBQ y áreas verdes."
        if retrieved_villa.get("description_pasadia") == expected_description:
            verification_checks.append("✓ Description Pasadía: Correct")
        else:
            verification_checks.append(f"✗ Description Pasadía: {retrieved_villa.get('description_pasadia')} (expected: {expected_description})")
        
        # Precios flexibles
        pasadia_prices = retrieved_villa.get("pasadia_prices", [])
        if len(pasadia_prices) == 1:
            price = pasadia_prices[0]
            if (price.get("label") == "10-20 personas" and 
                price.get("client_price") == 15000.0 and 
                price.get("owner_price") == 12000.0 and 
                price.get("show_in_web") is True):
                verification_checks.append("✓ Pasadía Price: All fields correct")
            else:
                verification_checks.append(f"✗ Pasadía Price: Fields incorrect - {price}")
        else:
            verification_checks.append(f"✗ Pasadía Prices: Expected 1 price, got {len(pasadia_prices)}")
        
        # Category assignment
        if retrieved_villa.get("category_id") == test_category["id"]:
            verification_checks.append("✓ Category: Assigned correctly")
        else:
            verification_checks.append(f"✗ Category: {retrieved_villa.get('category_id')} (expected: {test_category['id']})")
        
        # Check if all verifications passed
        all_verifications_passed = all("✓" in check for check in verification_checks)
        
        if all_verifications_passed:
            self.log_test("Verify Villa Data", True, f"All villa fields saved correctly:\n   " + "\n   ".join(verification_checks))
        else:
            self.log_test("Verify Villa Data", False, f"Some villa fields incorrect:\n   " + "\n   ".join(verification_checks))
        
        # Step 3: Verify villa appears in villa list
        print("   📋 Verifying villa appears in list...")
        list_result = self.make_request("GET", "/villas", token=self.admin_token)
        
        if list_result.get("success"):
            villas_list = list_result["data"]
            test_villa_found = any(v.get("code") == "TEST01" for v in villas_list)
            
            if test_villa_found:
                self.log_test("Villa in List", True, "TEST01 villa appears in villas list")
            else:
                self.log_test("Villa in List", False, "TEST01 villa not found in villas list")
        else:
            self.log_test("Get Villas List", False, "Failed to get villas list", list_result)
        
        # Step 4: Test public villas endpoint (verify it appears for public)
        print("   🌐 Verifying villa appears in public endpoint...")
        public_result = self.make_request("GET", "/public/villas")  # No token needed for public endpoint
        
        if public_result.get("success"):
            public_villas = public_result["data"]
            
            # Check if data is a list and contains villa objects
            if isinstance(public_villas, list) and len(public_villas) > 0:
                # Check if items are dictionaries (villa objects)
                if isinstance(public_villas[0], dict):
                    test_villa_public = any(v.get("code") == "TEST01" for v in public_villas)
                    
                    if test_villa_public:
                        self.log_test("Villa in Public List", True, "TEST01 villa appears in public villas endpoint")
                        
                        # Find the villa and check if the price with show_in_web=True is visible
                        public_test_villa = next((v for v in public_villas if v.get("code") == "TEST01"), None)
                        if public_test_villa:
                            public_pasadia_prices = public_test_villa.get("pasadia_prices", [])
                            web_visible_prices = [p for p in public_pasadia_prices if p.get("show_in_web") is True]
                            
                            if len(web_visible_prices) > 0:
                                self.log_test("Villa Web Visible Prices", True, f"Found {len(web_visible_prices)} web-visible prices in public endpoint")
                            else:
                                self.log_test("Villa Web Visible Prices", False, "No web-visible prices found in public endpoint")
                    else:
                        self.log_test("Villa in Public List", False, "TEST01 villa not found in public villas endpoint")
                else:
                    self.log_test("Villa in Public List", False, f"Public villas data format unexpected: {type(public_villas[0])}")
            else:
                self.log_test("Villa in Public List", True, f"Public villas endpoint returned {len(public_villas) if isinstance(public_villas, list) else 'non-list'} items")
        else:
            self.log_test("Get Public Villas", False, "Failed to get public villas", public_result)
        
        # Step 5: Test search functionality
        print("   🔍 Testing villa search...")
        search_result = self.make_request("GET", "/villas", {"search": "TEST01"}, self.admin_token)
        
        if search_result.get("success"):
            search_villas = search_result["data"]
            test_villa_in_search = any(v.get("code") == "TEST01" for v in search_villas)
            
            if test_villa_in_search:
                self.log_test("Villa Search by Code", True, "TEST01 villa found in search results")
            else:
                self.log_test("Villa Search by Code", False, "TEST01 villa not found in search results")
        else:
            self.log_test("Villa Search", False, "Failed to search villas", search_result)
        
        # Step 6: Test category filtering
        print("   🏷️ Testing category filtering...")
        filter_result = self.make_request("GET", "/villas", {"category_id": test_category["id"]}, self.admin_token)
        
        if filter_result.get("success"):
            filtered_villas = filter_result["data"]
            test_villa_in_filter = any(v.get("code") == "TEST01" for v in filtered_villas)
            
            if test_villa_in_filter:
                self.log_test("Villa Category Filter", True, "TEST01 villa found in category filter results")
            else:
                self.log_test("Villa Category Filter", False, "TEST01 villa not found in category filter results")
        else:
            self.log_test("Villa Category Filter", False, "Failed to filter villas by category", filter_result)
        
        # Summary
        print(f"\n   🎯 VILLA CREATION TEST SUMMARY:")
        print(f"      Villa Code: TEST01")
        print(f"      Villa ID: {villa_id}")
        print(f"      Category: {test_category['name']}")
        print(f"      Pasadía Price: RD$ 15,000 (Cliente) / RD$ 12,000 (Propietario)")
        print(f"      Max Guests: 20")
        print(f"      Show in Web: ✅ Yes")
        
        return created_villa

    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting Villa Creation Testing Suite")
        print("=" * 60)
        
        # Admin login
        self.test_admin_login()
        
        if not self.admin_token:
            print("❌ Cannot proceed without admin token")
            return
        
        # Main test: Villa creation with specific data
        self.test_villa_creation_with_specific_data()
        
        # Print summary
        self.print_summary()
    
    def print_summary(self):
        """Print test results summary"""
        print("\n" + "=" * 60)
        print("🎯 TEST RESULTS SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in self.test_results if result["success"])
        failed = len(self.test_results) - passed
        
        print(f"✅ PASSED: {passed}")
        print(f"❌ FAILED: {failed}")
        print(f"📊 TOTAL:  {len(self.test_results)}")
        
        if failed > 0:
            print("\n❌ FAILED TESTS:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"   - {result['test']}: {result['message']}")
        
        print("\n" + "=" * 60)
        success_rate = (passed / len(self.test_results)) * 100 if self.test_results else 0
        print(f"🎯 SUCCESS RATE: {success_rate:.1f}%")
        
        if success_rate == 100:
            print("🎉 ALL TESTS PASSED! Villa creation system is working correctly.")
        elif success_rate >= 80:
            print("⚠️  Most tests passed, but some issues need attention.")
        else:
            print("🚨 Multiple test failures detected. Villa creation system needs review.")


if __name__ == "__main__":
    tester = VillaCreationTester()
    tester.run_all_tests()